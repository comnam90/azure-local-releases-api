// Cloudflare Pages Function to serve API documentation
export async function onRequest(context: { request: Request; env: any }) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Redirect /api to /api/ for consistency
  if (url.pathname === '/api') {
    return Response.redirect(url.origin + '/api/', 302);
  }
  
  // Serve the API documentation HTML
  if (url.pathname === '/api/' || url.pathname === '/api/index.html') {
    try {
      // Read the API documentation HTML file
      const apiHtml = await fetch(new URL('/api.html', url.origin));
      if (!apiHtml.ok) {
        throw new Error('API documentation not found');
      }
      
      return new Response(await apiHtml.text(), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error: any) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>API Documentation</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 2rem; text-align: center; }
            .error { color: #d73a49; }
          </style>
        </head>
        <body>
          <h1>API Documentation</h1>
          <p class="error">Error loading API documentation: ${error?.message || 'Unknown error'}</p>
          <p>
            <a href="/api/releases">Try the releases endpoint directly</a> | 
            <a href="/api/releasetrains">Try the release trains endpoint</a>
          </p>
        </body>
        </html>
      `, {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
  }
  
  // Return 404 for other /api/* paths that aren't handled by other functions
  return new Response('Not Found', { status: 404 });
}
