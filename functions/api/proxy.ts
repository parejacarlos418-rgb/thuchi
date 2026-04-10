/**
 * Cloudflare Pages Function - API Proxy
 * Forwards requests to Google AI Sandbox API, bypassing CORS.
 * Route: POST /api/proxy
 */

interface ProxyRequest {
  url: string;
  method: string;
  token: string;
  body?: any;
}

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { url, method, token, body } = (await context.request.json()) as ProxyRequest;

    if (!url || !token) {
      return new Response(JSON.stringify({ error: 'Missing url or token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Only allow requests to Google APIs
    const allowed = ['aisandbox-pa.googleapis.com', 'labs.google'];
    const parsed = new URL(url);
    if (!allowed.some((h) => parsed.hostname.includes(h))) {
      return new Response(JSON.stringify({ error: 'Domain not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain;charset=UTF-8',
      Origin: 'https://labs.google',
      Referer: 'https://labs.google/',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    };

    const fetchOptions: RequestInit = { method: method || 'POST', headers };
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const responseBody = await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
