import { DataTransformer } from '../lib/data-transformer';
import { DataParser } from '../lib/data-parser';
import { FilterUtils } from '../lib/filters';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('API Response Tests', () => {
  let htmlData: string;
  let markdownData: string;

  beforeAll(() => {
    // Load test data
    htmlData = readFileSync(join(__dirname, '../../static/cache/release-information-23h2'), 'utf-8');
    markdownData = readFileSync(join(__dirname, '../../static/cache/import-discover-updates-offline-23h2.md'), 'utf-8');
  });

  describe('Releases API', () => {
    it('should transform and filter release data correctly', () => {
      // Parse external data
      const externalReleases = DataParser.parseReleaseInfo(htmlData);
      const externalSolutionUpdates = DataParser.parseSolutionUpdates(markdownData);

      // Transform to API format
      const apiReleases = DataTransformer.transformReleases(externalReleases, externalSolutionUpdates);

      expect(apiReleases.length).toBeGreaterThan(0);

      // Validate structure of first release
      const firstRelease = apiReleases[0];
      expect(firstRelease).toHaveProperty('version');
      expect(firstRelease).toHaveProperty('osBuild');
      expect(firstRelease).toHaveProperty('availabilityDate');
      expect(firstRelease).toHaveProperty('supported');
      expect(firstRelease).toHaveProperty('releaseTrain');
      expect(firstRelease).toHaveProperty('buildType');
      expect(firstRelease).toHaveProperty('urls');
      expect(firstRelease).toHaveProperty('solutionUpdate');
      expect(firstRelease.urls).toHaveProperty('security');
      expect(firstRelease.urls).toHaveProperty('news');
      expect(firstRelease.urls).toHaveProperty('issues');

      // Test filtering
      const supportedReleases = FilterUtils.filterReleases(apiReleases, { supported: true });
      expect(supportedReleases.length).toBeGreaterThan(0);
      expect(supportedReleases.every((r: any) => r.supported)).toBe(true);

      // Since all current releases are supported, test unsupported filter differently
      const unsupportedReleases = FilterUtils.filterReleases(apiReleases, { supported: false });
      expect(unsupportedReleases.every((r: any) => !r.supported)).toBe(true);
    });

    it('should filter by release train correctly', () => {
      const externalReleases = DataParser.parseReleaseInfo(htmlData);
      const externalSolutionUpdates = DataParser.parseSolutionUpdates(markdownData);
      const apiReleases = DataTransformer.transformReleases(externalReleases, externalSolutionUpdates);

      const releaseTrain25H2 = FilterUtils.filterReleases(apiReleases, { releaseTrain: '25H2' });
      expect(releaseTrain25H2.every((r: any) => r.releaseTrain === '25H2')).toBe(true);

      const releaseTrain24H2 = FilterUtils.filterReleases(apiReleases, { releaseTrain: '24H2' });
      expect(releaseTrain24H2.every((r: any) => r.releaseTrain === '24H2')).toBe(true);
    });

    it('should filter by build type correctly', () => {
      const externalReleases = DataParser.parseReleaseInfo(htmlData);
      const externalSolutionUpdates = DataParser.parseSolutionUpdates(markdownData);
      const apiReleases = DataTransformer.transformReleases(externalReleases, externalSolutionUpdates);

      const featureBuilds = FilterUtils.filterReleases(apiReleases, { buildType: 'Feature' });
      expect(featureBuilds.every((r: any) => r.buildType === 'Feature')).toBe(true);

      const cumulativeBuilds = FilterUtils.filterReleases(apiReleases, { buildType: 'Cumulative' });
      expect(cumulativeBuilds.every((r: any) => r.buildType === 'Cumulative')).toBe(true);
    });
  });

  describe('Release Trains API', () => {
    it('should transform to release trains correctly', () => {
      const externalReleases = DataParser.parseReleaseInfo(htmlData);
      const externalSolutionUpdates = DataParser.parseSolutionUpdates(markdownData);
      const apiReleases = DataTransformer.transformReleases(externalReleases, externalSolutionUpdates);

      const releaseTrains = DataTransformer.transformReleaseTrains(apiReleases);

      expect(releaseTrains.length).toBeGreaterThan(0);

      // Validate structure
      const firstTrain = releaseTrains[0];
      expect(firstTrain).toHaveProperty('releaseTrain');
      expect(firstTrain).toHaveProperty('supported');

      // Check that we have valid release train data
      expect(typeof firstTrain.releaseTrain).toBe('string');
      expect(typeof firstTrain.supported).toBe('boolean');
    });

    it('should filter release trains correctly', () => {
      const externalReleases = DataParser.parseReleaseInfo(htmlData);
      const externalSolutionUpdates = DataParser.parseSolutionUpdates(markdownData);
      const apiReleases = DataTransformer.transformReleases(externalReleases, externalSolutionUpdates);
      const releaseTrains = DataTransformer.transformReleaseTrains(apiReleases);

      const supportedTrains = FilterUtils.filterReleaseTrains(releaseTrains, { supported: true });
      expect(supportedTrains.every((t: any) => t.supported)).toBe(true);

      const unsupportedTrains = FilterUtils.filterReleaseTrains(releaseTrains, { supported: false });
      expect(unsupportedTrains.every((t: any) => !t.supported)).toBe(true);
    });
  });

  describe('Data Integration', () => {
    it('should correctly integrate HTML and markdown data', () => {
      const externalReleases = DataParser.parseReleaseInfo(htmlData);
      const externalSolutionUpdates = DataParser.parseSolutionUpdates(markdownData);
      const apiReleases = DataTransformer.transformReleases(externalReleases, externalSolutionUpdates);

      // Find releases that should have solution updates
      const releasesWithSolutionUpdates = apiReleases.filter((r: any) => r.solutionUpdate);
      expect(releasesWithSolutionUpdates.length).toBeGreaterThan(0);

      // Validate solution update structure
      const releaseWithUpdate = releasesWithSolutionUpdates[0];
      expect(releaseWithUpdate.solutionUpdate).toHaveProperty('uri');
      expect(releaseWithUpdate.solutionUpdate).toHaveProperty('fileHash');
    });

    it('should handle missing solution updates gracefully', () => {
      const externalReleases = DataParser.parseReleaseInfo(htmlData);
      const externalSolutionUpdates = DataParser.parseSolutionUpdates(markdownData);
      const apiReleases = DataTransformer.transformReleases(externalReleases, externalSolutionUpdates);

      // Find releases without solution updates (empty solutionUpdate object)
      const releasesWithoutSolutionUpdates = apiReleases.filter((r: any) => 
        !r.solutionUpdate || (!r.solutionUpdate.uri && !r.solutionUpdate.fileHash)
      );
      expect(releasesWithoutSolutionUpdates.length).toBeGreaterThan(0);

      // Validate they still have all required fields
      releasesWithoutSolutionUpdates.forEach((release: any) => {
        expect(release).toHaveProperty('version');
        expect(release).toHaveProperty('osBuild');
        expect(release).toHaveProperty('availabilityDate');
        expect(release).toHaveProperty('solutionUpdate');
      });
    });
  });
});
