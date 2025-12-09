import type { URLQuerySearchResponse, URLQuerySearchResult } from '../types/urlquery';

interface ProxySearchResponse {
  ok: boolean;
  error?: string;
  results?: URLQuerySearchResult[];
  count?: number;
  query?: string;
}

export class URLQueryService {
  private apiKey: string;
  private supabaseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  }

  async searchReports(query: string, limit = 30, offset = 0): Promise<URLQuerySearchResponse> {
    try {
      const params = new URLSearchParams({
        query: query,
        limit: limit.toString(),
        offset: offset.toString(),
        apiKey: this.apiKey,
      });

      const proxyUrl = `${this.supabaseUrl}/functions/v1/urlquery-proxy?${params.toString()}`;

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Proxy request failed (HTTP ${response.status}): ${errorText}`);
      }

      const data: ProxySearchResponse = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Unknown error from proxy');
      }

      const results: URLQuerySearchResult[] = (data.results || []).map((report: URLQuerySearchResult) => ({
        ...report,
        screenshotUrl: this.getScreenshotUrl(report.report_id),
      }));

      return {
        ok: true,
        results,
        count: data.count || 0,
        query: query,
      };
    } catch (error) {
      return {
        ok: false,
        results: [],
        count: 0,
        query: query,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  getScreenshotUrl(reportId: string): string {
    if (!this.supabaseUrl || !reportId) {
      return '';
    }
    return `${this.supabaseUrl}/functions/v1/screenshot-proxy?id=${reportId}&apiKey=${encodeURIComponent(this.apiKey)}`;
  }

  getReportUrl(reportId: string): string {
    return `https://urlquery.net/report/${reportId}`;
  }
}
