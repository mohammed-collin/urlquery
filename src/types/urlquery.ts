export interface URLQuerySearchResult {
  report_id: string;
  url: string;
  domain: string;
  report_date: string;
  score?: number;
  tags?: string[];
  screenshotUrl?: string;
  title?: string;
  firstSeen?: string;
  lastScan?: string;
  ip?: string;
  country?: string;
  country_code?: string;
}

export type ThreatType = 'phishing' | 'malware' | 'suspicious' | 'custom';

export interface ThreatTypeOption {
  value: ThreatType;
  label: string;
  query: string;
  description: string;
}

export interface URLQuerySearchResponse {
  ok: boolean;
  results: URLQuerySearchResult[];
  count: number;
  query: string;
  error?: string;
}

export interface URLQueryReport {
  report_id: string;
  url: string;
  domain: string;
  report_date: string;
  score: number;
  tags: string[];
  overview?: {
    malicious: boolean;
    reputation: string;
  };
}
