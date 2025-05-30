import { DataParser } from '../lib/data-parser';
import { DataTransformer } from '../lib/data-transformer';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Integration tests with cached data', () => {
  it('should parse real cached release data', () => {
    // Read the cached HTML file
    const htmlPath = join(__dirname, '../../static/cache/release-information-23h2');
    const html = readFileSync(htmlPath, 'utf-8');
    
    // Parse release information
    const releases = DataParser.parseReleaseInfo(html);
    
    expect(releases.length).toBeGreaterThan(0);
    
    // Check that we have expected data structure
    if (releases.length > 0) {
      const firstRelease = releases[0];
      expect(firstRelease).toHaveProperty('version');
      expect(firstRelease).toHaveProperty('osBuild');
      expect(firstRelease).toHaveProperty('availabilityDate');
      expect(firstRelease.version).toMatch(/\d+\.\d+/);
    }
  });

  it('should parse real solution updates data', () => {
    // Read the cached markdown file
    const mdPath = join(__dirname, '../../static/cache/import-discover-updates-offline-23h2.md');
    const markdown = readFileSync(mdPath, 'utf-8');
    
    // Parse solution updates
    const updates = DataParser.parseSolutionUpdates(markdown);
    
    expect(updates.length).toBeGreaterThan(0);
    
    // Check that we have expected data structure
    if (updates.length > 0) {
      const firstUpdate = updates[0];
      expect(firstUpdate).toHaveProperty('osBuild');
      expect(firstUpdate).toHaveProperty('downloadUri');
      expect(firstUpdate).toHaveProperty('sha256');
      expect(firstUpdate).toHaveProperty('availabilityDate');
    }
  });

  it('should transform parsed data correctly', () => {
    // Read and parse both data sources
    const htmlPath = join(__dirname, '../../static/cache/release-information-23h2');
    const mdPath = join(__dirname, '../../static/cache/import-discover-updates-offline-23h2.md');
    
    const html = readFileSync(htmlPath, 'utf-8');
    const markdown = readFileSync(mdPath, 'utf-8');
    
    const releaseData = DataParser.parseReleaseInfo(html);
    const solutionData = DataParser.parseSolutionUpdates(markdown);
    
    // Transform to API format
    const releases = DataTransformer.transformReleases(releaseData, solutionData);
    
    expect(releases.length).toBeGreaterThan(0);
    
    if (releases.length > 0) {
      const firstRelease = releases[0];
      expect(firstRelease).toHaveProperty('version');
      expect(firstRelease).toHaveProperty('releaseTrain');
      expect(firstRelease).toHaveProperty('supported');
      expect(firstRelease).toHaveProperty('buildType');
      expect(firstRelease).toHaveProperty('urls');
      expect(firstRelease.urls).toHaveProperty('security');
      expect(firstRelease.urls).toHaveProperty('news');
      expect(firstRelease.urls).toHaveProperty('issues');
    }
  });
});
