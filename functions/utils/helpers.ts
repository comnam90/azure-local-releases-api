/**
 * Create a JSON response with CORS headers
 */
export function createJsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * Create an error response
 */
export function createErrorResponse(message: string, status: number = 500): Response {
  return createJsonResponse({
    error: message,
    timestamp: new Date().toISOString(),
  }, status);
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsOptions(): Response {
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

/**
 * Validate and parse URL
 */
export function parseUrl(request: Request): { pathname: string; searchParams: URLSearchParams } {
  try {
    const url = new URL(request.url);
    return {
      pathname: url.pathname,
      searchParams: url.searchParams,
    };
  } catch (error) {
    throw new Error('Invalid URL');
  }
}

/**
 * Log request for debugging
 */
export function logRequest(request: Request, env?: any): void {
  const isDevelopment = env?.ENVIRONMENT === 'development';
  
  if (isDevelopment) {
    console.log(`${request.method} ${request.url}`);
  }
}

/**
 * Safely parse date string
 */
export function parseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Check if a string is a valid semantic version
 */
export function isValidVersion(version: string): boolean {
  const versionRegex = /^\d+\.\d+\.\d+(\.\d+)?$/;
  return versionRegex.test(version);
}

/**
 * Check if a release train is valid (4-digit year + 2-digit month)
 */
export function isValidReleaseTrain(releaseTrain: string): boolean {
  const trainRegex = /^\d{4}$/;
  return trainRegex.test(releaseTrain);
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
