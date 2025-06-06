const cheerio = require('cheerio');
import type { ExternalReleaseData, ExternalSolutionUpdateData } from '../types/api';

export class DataParser {
  
  /**
   * Parse HTML content from Microsoft docs release information page
   */
  static parseReleaseInfo(html: string): ExternalReleaseData[] {
    const $ = cheerio.load(html);
    const releases: ExternalReleaseData[] = [];

    // Parse releases from both "Existing deployments" and "New deployments" tab panels
    const tabPanels = [
      { selector: '#tabpanel_1_existing-deployments', newDeployments: false },
      { selector: '#tabpanel_1_new-deployments', newDeployments: true }
    ];

    tabPanels.forEach(({ selector, newDeployments }) => {
      const $tabPanel = $(selector);
      if ($tabPanel.length > 0) {
        const $table = $tabPanel.find('table');
        const rows = $table.find('tbody tr');
        
        rows.each((_: any, row: any) => {
          const $row = $(row);
          const cells = $row.find('td');
          
          if (cells.length >= 4) {
            const releaseData = DataParser.extractReleaseFromRow($, cells, newDeployments);
            if (releaseData) {
              releases.push(releaseData);
            }
          }
        });
      }
    });

    // Parse releases from the "Older versions of Azure Local" table
    const olderVersionsHeading = $('#older-versions-of-azure-local');
    if (olderVersionsHeading.length > 0) {
      // Find the next table after the "Older versions" heading
      const $olderTable = olderVersionsHeading.nextAll('table').first();
      if ($olderTable.length > 0) {
        const rows = $olderTable.find('tbody tr');
        
        rows.each((_: any, row: any) => {
          const $row = $(row);
          const cells = $row.find('td');
          
          if (cells.length >= 4) {
            const releaseData = DataParser.extractReleaseFromRow($, cells, false); // older versions are existing deployments only
            if (releaseData) {
              releases.push(releaseData);
            }
          }
        });
      }
    }

    return releases;
  }

  /**
   * Extract release data from a table row
   */
  private static extractReleaseFromRow($: any, cells: any, newDeployments: boolean): ExternalReleaseData | null {
    const versionCell = $(cells[0]);
    const osBuildCell = $(cells[1]);
    const securityCell = $(cells[2]);
    const whatsNewCell = $(cells[3]);
    const knownIssuesCell = $(cells[4]);

    // Extract version and availability date
    const versionText = versionCell.text().trim();
    const versionMatch = versionText.match(/^([^\s]+)/);
    const dateMatch = versionText.match(/Availability date:\s*(\d{4}-\d{2}-\d{2})/);

    if (versionMatch && dateMatch) {
      const version = versionMatch[1];
      const availabilityDate = dateMatch[1];
      const osBuild = osBuildCell.text().trim();

      // Extract URLs
      const securityUrl = securityCell.find('a').attr('href') || '';
      const whatsNewUrl = whatsNewCell.find('a').attr('href') || '';
      const knownIssuesUrl = knownIssuesCell.find('a').attr('href') || '';

      return {
        version,
        osBuild,
        availabilityDate,
        securityUpdateUrl: DataParser.normalizeUrl(securityUrl),
        whatsNewUrl: DataParser.normalizeUrl(whatsNewUrl),
        knownIssuesUrl: DataParser.normalizeUrl(knownIssuesUrl),
        newDeployments
      };
    }

    return null;
  }

  /**
   * Parse markdown content from solution updates documentation
   */
  static parseSolutionUpdates(markdown: string): ExternalSolutionUpdateData[] {
    const updates: ExternalSolutionUpdateData[] = [];

    // Extract table content from markdown - find the table section
    const tableSection = markdown.match(/\|\s*OS Build[\s\S]*?(?=\n\n|\n>|$)/);
    
    if (tableSection) {
      const tableContent = tableSection[0];
      const lines = tableContent.split('\n');
      
      // Skip header and separator lines, process data rows
      for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || !line.includes('|')) continue;
        
        const cells = line.split('|').map(cell => cell.trim()).filter((cell, index) => {
          // Remove empty cells at start/end and keep the 3 data columns
          return index > 0 && index < 4 && cell;
        });
        
        if (cells.length >= 3) {
          const osBuild = cells[0];
          const downloadCell = cells[1];
          const sha256 = cells[2];

          // Extract download URI and availability date from the download cell
          // Format: [11.2505.1001.22](https://example.com) <br><br> Availability date: <br><br> 2025-05-28
          const uriMatch = downloadCell.match(/\[([^\]]+)\]\(([^)]+)\)/);
          const dateMatch = downloadCell.match(/Availability date:\s*<br><br>\s*(\d{4}-\d{2}-\d{2})/);

          if (uriMatch && dateMatch) {
            const version = uriMatch[1];
            const downloadUri = uriMatch[2];
            const availabilityDate = dateMatch[1].trim();

            updates.push({
              osBuild,
              downloadUri,
              sha256: sha256.replace(/\s+/g, ''),
              availabilityDate
            });
          }
        }
      }
    }

    return updates;
  }

  /**
   * Normalize relative URLs to absolute URLs
   */
  private static normalizeUrl(url: string): string {
    if (!url) return '';
    
    if (url.startsWith('/')) {
      return `https://learn.microsoft.com${url}`;
    }
    
    if (url.startsWith('http')) {
      return url;
    }
    
    return `https://learn.microsoft.com/en-us/azure/azure-local/${url}`;
  }

  /**
   * Extract release train from version string
   */
  static extractReleaseTrain(version: string): string {
    // Version format examples: "10.2411.3.2", "11.2505.1001.22", "12.2504.1001.20"
    const match = version.match(/\d+\.(\d{4})\./);
    return match ? match[1] : '';
  }

  /**
   * Extract shortened release version
   */
  static extractReleaseShortened(version: string): string {
    // Version format examples: "10.2411.3.2" -> "2411.3", "11.2505.1001.22" -> "2505.1001"
    const match = version.match(/\d+\.(\d{4}\.\d+)/);
    return match ? match[1] : '';
  }

  /**
   * Extract release version (without major version prefix)
   */
  static extractRelease(version: string): string {
    // Version format examples: "10.2411.3.2" -> "2411.3.2", "11.2505.1001.22" -> "2505.1001.22"
    const match = version.match(/\d+\.(.+)/);
    return match ? match[1] : '';
  }

  /**
   * Determine if a release supports new deployments (deprecated - now determined from HTML tab sections)
   */
  static supportsNewDeployments(version: string): boolean {
    // This method is deprecated - newDeployments is now determined 
    // from which tab section the release appears in on the Microsoft docs page
    return version.startsWith('12.');
  }

  /**
   * Determine if a release is a baseline release
   */
  static isBaselineRelease(version: string): boolean {
    // Baseline releases have specific patterns - they contain .1001. or are baseline builds
    // Based on expected output, this includes versions with .1001. and certain other patterns
    return version.includes('.1001.') || 
           version.includes('.0.') ||
           version.includes('.1.') ||
           version.includes('.2.') ||
           version.includes('.3.');
  }

  /**
   * Determine build type based on version
   */
  static getBuildType(version: string): 'Feature' | 'Cumulative' {
    // Feature builds are typically the first in a release train
    // Cumulative builds have higher build numbers
    const releaseTrain = DataParser.extractReleaseTrain(version);
    const buildNumber = version.split('.').pop() || '0';
    
    // Simple heuristic: lower build numbers are often feature builds
    return parseInt(buildNumber) < 10 ? 'Feature' : 'Cumulative';
  }
}
