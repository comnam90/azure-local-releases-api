import { FilterUtils } from '../lib/filters';
import type { Release, ReleaseTrain } from '../types/api';

describe('FilterUtils', () => {
  const sampleReleases: Release[] = [
    {
      version: '11.2505.1001.22',
      availabilityDate: '2025-05-28',
      newDeployments: true,
      osBuild: '25398.1611',
      releaseTrain: '2505',
      release: '2505.1001.22',
      releaseShortened: '2505.1001',
      baselineRelease: true,
      buildType: 'Feature',
      supported: true,
      solutionUpdate: { uri: 'https://example.com', fileHash: 'abc123' },
      urls: { security: '', news: '', issues: '' }
    },
    {
      version: '10.2411.3.2',
      availabilityDate: '2025-02-20',
      newDeployments: false,
      osBuild: '25398.1425',
      releaseTrain: '2411',
      release: '2411.3.2',
      releaseShortened: '2411.3',
      baselineRelease: false,
      buildType: 'Cumulative',
      supported: true,
      solutionUpdate: {},
      urls: { security: '', news: '', issues: '' }
    }
  ];

  describe('filterReleases', () => {
    it('should filter by supported status', () => {
      const filtered = FilterUtils.filterReleases(sampleReleases, { supported: true });
      expect(filtered).toHaveLength(2);
    });

    it('should filter by release train', () => {
      const filtered = FilterUtils.filterReleases(sampleReleases, { releaseTrain: '2505' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].releaseTrain).toBe('2505');
    });

    it('should filter by baseline release', () => {
      const filtered = FilterUtils.filterReleases(sampleReleases, { baselineRelease: true });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].baselineRelease).toBe(true);
    });

    it('should filter by build type', () => {
      const filtered = FilterUtils.filterReleases(sampleReleases, { buildType: 'Feature' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].buildType).toBe('Feature');
    });

    it('should filter by solution update availability', () => {
      const filtered = FilterUtils.filterReleases(sampleReleases, { solutionUpdate: true });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].solutionUpdate.uri).toBeTruthy();
    });

    it('should return latest release when latest=true', () => {
      const filtered = FilterUtils.filterReleases(sampleReleases, { latest: true });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].version).toBe('11.2505.1001.22'); // Most recent date
    });
  });

  describe('parseReleasesQuery', () => {
    it('should parse boolean parameters', () => {
      const searchParams = new URLSearchParams('supported=true&latest=false');
      const params = FilterUtils.parseReleasesQuery(searchParams);
      expect(params.supported).toBe(true);
      expect(params.latest).toBe(false);
    });

    it('should parse string parameters', () => {
      const searchParams = new URLSearchParams('releaseTrain=2505&buildType=Feature');
      const params = FilterUtils.parseReleasesQuery(searchParams);
      expect(params.releaseTrain).toBe('2505');
      expect(params.buildType).toBe('Feature');
    });
  });
});
