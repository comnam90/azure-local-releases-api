import type { Release, ReleaseTrain, ExternalReleaseData, ExternalSolutionUpdateData, SolutionUpdate } from '../types/api';
import { DataParser } from './data-parser';

export class DataTransformer {
  
  /**
   * Transform external release data into API release format
   */
  static transformReleases(
    releaseData: ExternalReleaseData[], 
    solutionData: ExternalSolutionUpdateData[]
  ): Release[] {
    const releases: Release[] = [];

    // First, determine which releases are Feature builds (first in each release train)
    const featureBuilds = DataTransformer.determineFeatureBuilds(releaseData);

    for (const release of releaseData) {
      // Find matching solution update data
      const solutionUpdate = solutionData.find(su => su.osBuild === release.osBuild);

      // Extract version components
      const releaseTrain = DataParser.extractReleaseTrain(release.version);
      const releaseVersion = DataParser.extractRelease(release.version);
      const releaseShortened = DataParser.extractReleaseShortened(release.version);
      
      // Use the newDeployments flag from the parsed data (based on tab section)
      const newDeployments = release.newDeployments;
      
      // Determine baseline release status
      const baselineRelease = DataParser.isBaselineRelease(release.version);
      
      // Determine build type based on whether this is the first release in the train
      const buildType = featureBuilds.has(release.version) ? 'Feature' : 'Cumulative';
      
      // Calculate support status and end of support date
      const { supported, endOfSupportDate } = DataTransformer.calculateSupportStatus(
        release.availabilityDate, 
        releaseTrain
      );

      // Transform solution update data
      const solutionUpdateInfo: SolutionUpdate = solutionUpdate ? {
        uri: solutionUpdate.downloadUri,
        fileHash: solutionUpdate.sha256
      } : {};

      const transformedRelease: Release = {
        version: release.version,
        availabilityDate: release.availabilityDate,
        newDeployments,
        osBuild: release.osBuild,
        releaseTrain,
        release: releaseVersion,
        releaseShortened,
        baselineRelease,
        buildType,
        endOfSupportDate,
        supported,
        solutionUpdate: solutionUpdateInfo,
        urls: {
          security: release.securityUpdateUrl,
          news: release.whatsNewUrl,
          issues: release.knownIssuesUrl
        }
      };

      releases.push(transformedRelease);
    }

    return releases.sort((a, b) => 
      new Date(b.availabilityDate).getTime() - new Date(a.availabilityDate).getTime()
    );
  }

  /**
   * Transform releases into release trains
   */
  static transformReleaseTrains(releases: Release[]): ReleaseTrain[] {
    const trainMap = new Map<string, { latestRelease: Release; supported: boolean }>();

    // Find the latest release for each train and determine support status
    for (const release of releases) {
      if (!trainMap.has(release.releaseTrain)) {
        trainMap.set(release.releaseTrain, {
          latestRelease: release,
          supported: release.supported
        });
      } else {
        const existing = trainMap.get(release.releaseTrain)!;
        // If this release is newer, update the latest release and support status
        if (new Date(release.availabilityDate) > new Date(existing.latestRelease.availabilityDate)) {
          existing.latestRelease = release;
          existing.supported = release.supported;
        }
      }
    }

    return Array.from(trainMap.values()).map(({ latestRelease, supported }) => ({
      releaseTrain: latestRelease.releaseTrain,
      supported
    })).sort((a, b) => 
      parseInt(b.releaseTrain) - parseInt(a.releaseTrain)
    );
  }

  /**
   * Calculate support status and end of support date
   */
  private static calculateSupportStatus(availabilityDate: string, releaseTrain: string): {
    supported: boolean;
    endOfSupportDate?: string;
  } {
    const releaseDate = new Date(availabilityDate);
    const now = new Date();
    
    // Support window: 180 days from availability date
    const endOfSupportDate = new Date(releaseDate);
    endOfSupportDate.setDate(endOfSupportDate.getDate() + 180);
    
    const supported = now <= endOfSupportDate;
    
    return {
      supported,
      endOfSupportDate: endOfSupportDate.toISOString().split('T')[0]
    };
  }

  /**
   * Get the latest release overall
   */
  static getLatestRelease(releases: Release[]): Release | undefined {
    return releases
      .filter(r => r.supported)
      .sort((a, b) => new Date(b.availabilityDate).getTime() - new Date(a.availabilityDate).getTime())[0];
  }

  /**
   * Get the latest release for each release train
   */
  static getLatestReleasesByTrain(releases: Release[]): Release[] {
    const trainMap = new Map<string, Release>();

    for (const release of releases) {
      const existing = trainMap.get(release.releaseTrain);
      if (!existing || new Date(release.availabilityDate) > new Date(existing.availabilityDate)) {
        trainMap.set(release.releaseTrain, release);
      }
    }

    return Array.from(trainMap.values());
  }

  /**
   * Get the latest supported release train
   */
  static getLatestSupportedTrain(releaseTrains: ReleaseTrain[]): ReleaseTrain | undefined {
    return releaseTrains
      .filter(rt => rt.supported)
      .sort((a, b) => parseInt(b.releaseTrain) - parseInt(a.releaseTrain))[0];
  }

  /**
   * Determine which releases are Feature builds (first in each release train)
   */
  static determineFeatureBuilds(releaseData: ExternalReleaseData[]): Set<string> {
    const featureBuilds = new Set<string>();
    const trainMap = new Map<string, ExternalReleaseData>();

    // Find the earliest release in each release train
    for (const release of releaseData) {
      const releaseTrain = DataParser.extractReleaseTrain(release.version);
      const existing = trainMap.get(releaseTrain);
      
      if (!existing || new Date(release.availabilityDate) < new Date(existing.availabilityDate)) {
        trainMap.set(releaseTrain, release);
      }
    }

    // Mark the earliest release in each train as a Feature build
    for (const release of trainMap.values()) {
      featureBuilds.add(release.version);
    }

    return featureBuilds;
  }
}
