import { DataFetcher } from '../lib/fetcher';
import { DataParser } from '../lib/data-parser';
import { DataTransformer } from '../lib/data-transformer';
import { FilterUtils } from '../lib/filters';
import { createJsonResponse, createErrorResponse, parseUrl, logRequest } from '../utils/helpers';
import type { Env, ReleaseTrainsResponse } from '../types/api';

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Log request for debugging
  logRequest(request, env);

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Only allow GET requests
  if (request.method !== 'GET') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    // Parse URL and query parameters
    const { searchParams } = parseUrl(request);
    const queryParams = FilterUtils.parseReleaseTrainsQuery(searchParams);

    // Initialize data fetcher
    const fetcher = new DataFetcher(env);

    // Fetch data from external sources
    const [releaseInfoHtml, solutionUpdatesMarkdown] = await Promise.all([
      fetcher.fetchWithFallback('release-info'),
      fetcher.fetchWithFallback('solution-updates')
    ]);

    // Parse the external data
    const releaseData = DataParser.parseReleaseInfo(releaseInfoHtml);
    const solutionData = DataParser.parseSolutionUpdates(solutionUpdatesMarkdown);

    // Transform to API format
    const releases = DataTransformer.transformReleases(releaseData, solutionData);
    const releaseTrains = DataTransformer.transformReleaseTrains(releases);

    // Apply filters
    const filteredReleaseTrains = FilterUtils.filterReleaseTrains(releaseTrains, queryParams);

    // Create response
    const response: ReleaseTrainsResponse = {
      releaseTrains: filteredReleaseTrains
    };

    return createJsonResponse(response);

  } catch (error) {
    console.error('Error in /api/releasetrains:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return createErrorResponse('Failed to fetch release data from external sources', 502);
      }
      if (error.message.includes('parse')) {
        return createErrorResponse('Failed to parse release data', 500);
      }
    }

    return createErrorResponse('Internal server error', 500);
  }
}
