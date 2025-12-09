import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    const query = url.searchParams.get('query');
    const limit = url.searchParams.get('limit') || '30';
    const offset = url.searchParams.get('offset') || '0';
    const apiKey = url.searchParams.get('apiKey') || URLQUERY_API_KEY;

    if (!query) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Query parameter is required', results: [], count: 0 }),
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
      return new Response(
        JSON.stringify({ ok: false, error: 'URLQuery API key not provided', results: [], count: 0 }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const params = new URLSearchParams({
      query: query,
      limit: limit,
      offset: offset,
    });

    const apiUrl = `${API_BASE}${API_VERSION}/search/reports/?${params.toString()}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: `URLQuery API error (HTTP ${response.status}): ${errorText}`,
          results: [],
          count: 0,
          query: query
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();

    console.log('URLQuery API raw response sample:', JSON.stringify({
      totalReports: data.reports?.length || 0,
      totalHits: data.total_hits,
      firstReport: data.reports?.[0] || null,
      firstReportUrl: data.reports?.[0]?.url || null,
    }, null, 2));

    const processedResults = (data.reports || []).map((report: any) => {
      const urlData = report.url || {};

      const urlAddr = urlData.addr || urlData.address || report.url_addr || '';
      const urlSchema = urlData.schema || urlData.scheme || 'http';
      const fullUrl = urlAddr ? `${urlSchema}://${urlAddr}` : '';

      const ip = urlData.ip || urlData.ipv4 || urlData.ip_address || report.ip || null;
      const country = urlData.country || urlData.country_name || report.country || null;
      const countryCode = urlData.country_code || urlData.cc || report.country_code || null;

      const processed = {
        report_id: report.report_id,
        url: fullUrl || urlAddr,
        domain: urlData.domain || urlData.fqdn || urlData.hostname || '',
        report_date: report.date || report.scan_date || report.created_at || '',
        score: report.stats?.alert_count?.urlquery || report.score || 0,
        tags: report.tags || [],
        title: fullUrl || urlAddr,
        firstSeen: report.date,
        lastScan: report.date,
        ip: ip,
        country: country,
        country_code: countryCode,
      };

      if (processed.ip) {
        console.log('Found IP in report:', {
          report_id: processed.report_id,
          ip: processed.ip,
          country: processed.country,
          country_code: processed.country_code
        });
      }

      return processed;
    });

    console.log('Processed results summary:', {
      total: processedResults.length,
      withIPs: processedResults.filter(r => r.ip).length,
      sampleWithIP: processedResults.find(r => r.ip) || null
    });

    const result = {
      ok: true,
      results: processedResults,
      count: data.total_hits || 0,
      query: query,
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        results: [],
        count: 0,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});