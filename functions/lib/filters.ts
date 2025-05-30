import type { Release, ReleaseTrain, ReleasesQueryParams, ReleaseTrainsQueryParams } from '../types/api';

export class FilterUtils {
  
  /**
   * Filter releases based on query parameters
   */
  static filterReleases(releases: Release[], params: ReleasesQueryParams): Release[] {
    let filtered = [...releases];

    // Filter by supported status
    if (params.supported !== undefined) {
      filtered = filtered.filter(r => r.supported === params.supported);
    }

    // Filter by release train
    if (params.releaseTrain) {
      filtered = filtered.filter(r => r.releaseTrain === params.releaseTrain);
    }

    // Filter by baseline release status
    if (params.baselineRelease !== undefined) {
      filtered = filtered.filter(r => r.baselineRelease === params.baselineRelease);
    }

    // Filter by build type
    if (params.buildType) {
      filtered = filtered.filter(r => r.buildType === params.buildType);
    }

    // Filter by specific version
    if (params.version) {
      filtered = filtered.filter(r => r.version === params.version);
    }

    // Filter by OS build
    if (params.osBuild) {
      filtered = filtered.filter(r => r.osBuild === params.osBuild);
    }

    // Filter by new deployments capability
    if (params.newDeployments !== undefined) {
      filtered = filtered.filter(r => r.newDeployments === params.newDeployments);
    }

    // Filter by solution update availability
    if (params.solutionUpdate !== undefined) {
      if (params.solutionUpdate) {
        filtered = filtered.filter(r => r.solutionUpdate.uri && r.solutionUpdate.fileHash);
      } else {
        filtered = filtered.filter(r => !r.solutionUpdate.uri && !r.solutionUpdate.fileHash);
      }
    }

    // Filter to latest releases only
    if (params.latest) {
      if (params.releaseTrain) {
        // Latest in specific release train
        filtered = FilterUtils.getLatestInReleaseTrain(filtered, params.releaseTrain);
      } else {
        // Latest overall
        const latest = FilterUtils.getLatestRelease(filtered);
        filtered = latest ? [latest] : [];
      }
    }

    return filtered;
  }

  /**
   * Filter release trains based on query parameters
   */
  static filterReleaseTrains(releaseTrains: ReleaseTrain[], params: ReleaseTrainsQueryParams): ReleaseTrain[] {
    let filtered = [...releaseTrains];

    // Filter by supported status
    if (params.supported !== undefined) {
      filtered = filtered.filter(rt => rt.supported === params.supported);
    }

    // Filter by specific release train
    if (params.releaseTrain) {
      filtered = filtered.filter(rt => rt.releaseTrain === params.releaseTrain);
    }

    // Filter to latest release train only
    if (params.latest) {
      const latest = FilterUtils.getLatestReleaseTrain(filtered);
      filtered = latest ? [latest] : [];
    }

    return filtered;
  }

  /**
   * Get the latest release overall
   */
  private static getLatestRelease(releases: Release[]): Release | undefined {
    return releases
      .sort((a, b) => new Date(b.availabilityDate).getTime() - new Date(a.availabilityDate).getTime())[0];
  }

  /**
   * Get the latest release in a specific release train
   */
  private static getLatestInReleaseTrain(releases: Release[], releaseTrain: string): Release[] {
    const trainReleases = releases.filter(r => r.releaseTrain === releaseTrain);
    const latest = trainReleases
      .sort((a, b) => new Date(b.availabilityDate).getTime() - new Date(a.availabilityDate).getTime())[0];
    
    return latest ? [latest] : [];
  }

  /**
   * Get the latest release train
   */
  private static getLatestReleaseTrain(releaseTrains: ReleaseTrain[]): ReleaseTrain | undefined {
    return releaseTrains
      .sort((a, b) => parseInt(b.releaseTrain) - parseInt(a.releaseTrain))[0];
  }

  /**
   * Parse query parameters from URL search params
   */
  static parseReleasesQuery(searchParams: URLSearchParams): ReleasesQueryParams {
    const params: ReleasesQueryParams = {};

    // Parse boolean parameters
    const supported = searchParams.get('supported');
    if (supported !== null) {
      params.supported = supported.toLowerCase() === 'true';
    }

    const baselineRelease = searchParams.get('baselineRelease');
    if (baselineRelease !== null) {
      params.baselineRelease = baselineRelease.toLowerCase() === 'true';
    }

    const newDeployments = searchParams.get('newDeployments');
    if (newDeployments !== null) {
      params.newDeployments = newDeployments.toLowerCase() === 'true';
    }

    const solutionUpdate = searchParams.get('solutionUpdate');
    if (solutionUpdate !== null) {
      params.solutionUpdate = solutionUpdate.toLowerCase() === 'true';
    }

    const latest = searchParams.get('latest');
    if (latest !== null) {
      params.latest = latest.toLowerCase() === 'true';
    }

    // Parse string parameters
    const releaseTrain = searchParams.get('releaseTrain');
    if (releaseTrain) {
      params.releaseTrain = releaseTrain;
    }

    const buildType = searchParams.get('buildType');
    if (buildType && (buildType === 'Feature' || buildType === 'Cumulative')) {
      params.buildType = buildType;
    }

    const version = searchParams.get('version');
    if (version) {
      params.version = version;
    }

    const osBuild = searchParams.get('osBuild');
    if (osBuild) {
      params.osBuild = osBuild;
    }

    return params;
  }

  /**
   * Parse release trains query parameters
   */
  static parseReleaseTrainsQuery(searchParams: URLSearchParams): ReleaseTrainsQueryParams {
    const params: ReleaseTrainsQueryParams = {};

    // Parse boolean parameters
    const supported = searchParams.get('supported');
    if (supported !== null) {
      params.supported = supported.toLowerCase() === 'true';
    }

    const latest = searchParams.get('latest');
    if (latest !== null) {
      params.latest = latest.toLowerCase() === 'true';
    }

    // Parse string parameters
    const releaseTrain = searchParams.get('releaseTrain');
    if (releaseTrain) {
      params.releaseTrain = releaseTrain;
    }

    return params;
  }
}
