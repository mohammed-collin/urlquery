export interface ScanResult {
  id: string;
  url: string;
  report_id: string;
  tags: string[];
  brand: string | null;
  threat_types: string[];
  scan_date: string;
  created_at: string;
  user_id?: string | null;
}

export interface BrandStats {
  brand: string;
  count: number;
  color: string;
}
