import { DataParser } from '../lib/data-parser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Debug markdown parsing', () => {
  it('should parse solution updates correctly', () => {
    const mdPath = join(__dirname, '../../static/cache/import-discover-updates-offline-23h2.md');
    const markdown = readFileSync(mdPath, 'utf-8');
    
    const updates = DataParser.parseSolutionUpdates(markdown);
    
    expect(updates).toHaveLength(3);
    expect(updates[0]).toEqual({
      osBuild: '25398.1611',
      downloadUri: 'https://azurestackreleases.download.prss.microsoft.com/dbazure/AzureLocal/CombinedSolutionBundle/11.2505.1001.22/CombinedSolutionBundle.11.2505.1001.22.zip',
      sha256: 'AB2C7CE74168BF9FD679E7CE644BC57A20A0A3A418C5E8663EBCF53FC0B45113',
      availabilityDate: '2025-05-28'
    });
  });
});
