import { CacheManager } from './cache';
import type { Env, ExternalReleaseData, ExternalSolutionUpdateData } from '../types/api';

export class DataFetcher {
  private cache: CacheManager;
  
  // External URLs
  private static readonly RELEASE_INFO_URL = 'https://learn.microsoft.com/en-us/azure/azure-local/release-information-23h2';
  private static readonly SOLUTION_UPDATES_URL = 'https://raw.githubusercontent.com/MicrosoftDocs/azure-stack-docs/refs/heads/main/azure-local/update/import-discover-updates-offline-23h2.md';

  constructor(env: Env) {
    this.cache = new CacheManager(env);
  }

  /**
   * Fetch release information with caching
   */
  async fetchReleaseInfo(): Promise<string> {
    const cacheKey = CacheManager.getCacheKey('release-info');
    
    // Try to get from cache first
    const cached = await this.cache.get<string>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from external source
    try {
      const response = await fetch(DataFetcher.RELEASE_INFO_URL, {
        headers: {
          'User-Agent': 'Azure Local Releases API Bot'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Cache the result
      await this.cache.set(
        cacheKey, 
        html, 
        CacheManager.getTTL('release-info')
      );

      return html;
    } catch (error) {
      console.error('Failed to fetch release info:', error);
      throw new Error('Failed to fetch release information from external source');
    }
  }

  /**
   * Fetch solution updates information with caching
   */
  async fetchSolutionUpdates(): Promise<string> {
    const cacheKey = CacheManager.getCacheKey('solution-updates');
    
    // Try to get from cache first
    const cached = await this.cache.get<string>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from external source
    try {
      const response = await fetch(DataFetcher.SOLUTION_UPDATES_URL, {
        headers: {
          'User-Agent': 'Azure Local Releases API Bot'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const markdown = await response.text();
      
      // Cache the result
      await this.cache.set(
        cacheKey, 
        markdown, 
        CacheManager.getTTL('solution-updates')
      );

      return markdown;
    } catch (error) {
      console.error('Failed to fetch solution updates:', error);
      throw new Error('Failed to fetch solution updates from external source');
    }
  }

  /**
   * Fetch data with fallback to static cache files
   */
  async fetchWithFallback(type: 'release-info' | 'solution-updates'): Promise<string> {
    try {
      // Try to fetch from external source first
      if (type === 'release-info') {
        return await this.fetchReleaseInfo();
      } else {
        return await this.fetchSolutionUpdates();
      }
    } catch (error) {
      console.warn(`External fetch failed for ${type}, attempting fallback to static cache`);
      
      // Fallback to static cache files (will be implemented in Phase 4)
      // For now, re-throw the error
      throw error;
    }
  }
}
