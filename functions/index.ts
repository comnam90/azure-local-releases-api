import { createErrorResponse, handleCorsOptions, parseUrl, logRequest } from './utils/helpers';
import type { Env } from './types/api';

// Import API endpoints
import * as releasesApi from './api/releases';
import * as releaseTrainsApi from './api/releasetrains';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Log request for debugging
    logRequest(request, env);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCorsOptions();
    }

    try {
      // Parse URL
      const { pathname } = parseUrl(request);

      // Route requests to appropriate handlers
      switch (pathname) {
        case '/api/releases':
          return await releasesApi.onRequest({ request, env });
        
        case '/api/releasetrains':
          return await releaseTrainsApi.onRequest({ request, env });
        
        case '/':
        case '/index.html':
          return new Response('Azure Local Releases API - Phase 1 Implementation Complete', {
            headers: { 'Content-Type': 'text/plain' }
          });
        
        case '/health':
          return new Response(JSON.stringify({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }), {
            headers: { 'Content-Type': 'application/json' }
          });

        default:
          return createErrorResponse('Not found', 404);
      }

    } catch (error) {
      console.error('Router error:', error);
      return createErrorResponse('Internal server error', 500);
    }
  },
} satisfies ExportedHandler<Env>;
