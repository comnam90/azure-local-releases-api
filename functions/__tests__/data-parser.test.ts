import { DataParser } from '../lib/data-parser';

describe('DataParser', () => {
  describe('parseReleaseInfo', () => {
    it('should parse release information from HTML', () => {
      const sampleHtml = `
        <table>
          <tbody>
            <tr>
              <td>11.2505.1001.22 <br><br> Availability date: <br><br> 2025-05-28</td>
              <td>25398.1611</td>
              <td><a href="/security-update">May OS security update</a></td>
              <td><a href="/whats-new">Features and improvements</a></td>
              <td><a href="/known-issues">Known issues</a></td>
            </tr>
          </tbody>
        </table>
      `;

      const releases = DataParser.parseReleaseInfo(sampleHtml);

      expect(releases).toHaveLength(1);
      expect(releases[0]).toEqual({
        version: '11.2505.1001.22',
        osBuild: '25398.1611',
        availabilityDate: '2025-05-28',
        securityUpdateUrl: 'https://learn.microsoft.com/security-update',
        whatsNewUrl: 'https://learn.microsoft.com/whats-new',
        knownIssuesUrl: 'https://learn.microsoft.com/known-issues'
      });
    });
  });

  describe('parseSolutionUpdates', () => {
    it('should parse solution updates from markdown', () => {
      const sampleMarkdown = `
| OS Build     | Download URI       | SHA256                          |
|--------------|--------------------|---------------------------------|
| 25398.1611   | [11.2505.1001.22](https://example.com/download) <br><br> Availability date: <br><br> 2025-05-28 | ABC123 |
      `;

      const updates = DataParser.parseSolutionUpdates(sampleMarkdown);

      expect(updates).toHaveLength(1);
      expect(updates[0]).toEqual({
        osBuild: '25398.1611',
        downloadUri: 'https://example.com/download',
        sha256: 'ABC123',
        availabilityDate: '2025-05-28'
      });
    });
  });

  describe('extractReleaseTrain', () => {
    it('should extract release train from version', () => {
      expect(DataParser.extractReleaseTrain('11.2505.1001.22')).toBe('2505');
      expect(DataParser.extractReleaseTrain('10.2411.3.2')).toBe('2411');
    });
  });

  describe('extractReleaseShortened', () => {
    it('should extract shortened release version', () => {
      expect(DataParser.extractReleaseShortened('11.2505.1001.22')).toBe('2505.1001');
      expect(DataParser.extractReleaseShortened('10.2411.3.2')).toBe('2411.3');
    });
  });

  describe('isBaselineRelease', () => {
    it('should identify baseline releases', () => {
      expect(DataParser.isBaselineRelease('12.2504.1001.20')).toBe(true);
      expect(DataParser.isBaselineRelease('11.2505.1001.22')).toBe(true);
      expect(DataParser.isBaselineRelease('10.2411.3.2')).toBe(false);
    });
  });

  describe('getBuildType', () => {
    it('should determine build type', () => {
      expect(DataParser.getBuildType('10.2411.1.1')).toBe('Feature');
      expect(DataParser.getBuildType('10.2411.3.20')).toBe('Cumulative');
    });
  });
});
