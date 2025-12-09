import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const URLQUERY_API_KEY = Deno.env.get('URLQUERY_API_KEY');
const API_BASE = 'https://api.urlquery.net';
const API_VERSION = '/public/v1';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const reportId = url.searchParams.get('id');
    const apiKey = url.searchParams.get('apiKey') || URLQUERY_API_KEY;

    if (!reportId) {
      return new Response(
        JSON.stringify({ error: 'Report ID is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!apiKey) {
      console.error('URLQuery API key not provided');
      return new Response(
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="240"%3E%3Crect fill="%23334155" width="320" height="240"/%3E%3Ctext x="50%25" y="50%25" font-size="14" fill="%2394a3b8" text-anchor="middle" dy=".3em"%3EScreenshot unavailable%3C/text%3E%3C/svg%3E',
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'image/svg+xml',
          },
        }
      );
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(reportId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid report ID format' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const screenshotUrl = `${API_BASE}${API_VERSION}/report/${reportId}/screenshot`;

    const response = await fetch(screenshotUrl, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey,
      },
    });

    if (!response.ok) {
      console.error(`URLQuery API error: ${response.status}`);
      return new Response(
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="240"%3E%3Crect fill="%23334155" width="320" height="240"/%3E%3Ctext x="50%25" y="50%25" font-size="14" fill="%2394a3b8" text-anchor="middle" dy=".3em"%3EScreenshot unavailable%3C/text%3E%3C/svg%3E',
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'image/svg+xml',
          },
        }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const imageData = await response.arrayBuffer();

    return new Response(imageData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Screenshot proxy error:', error);
    return new Response(
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="240"%3E%3Crect fill="%23334155" width="320" height="240"/%3E%3Ctext x="50%25" y="50%25" font-size="14" fill="%2394a3b8" text-anchor="middle" dy=".3em"%3EScreenshot unavailable%3C/text%3E%3C/svg%3E',
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/svg+xml',
        },
      }
    );
  }
});