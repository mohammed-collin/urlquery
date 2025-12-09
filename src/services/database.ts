import { createClient } from '@supabase/supabase-js';
import type { ScanResult } from '../types/scan';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export class DatabaseService {
  async saveScanResult(data: {
    url: string;
    report_id: string;
    tags: string[];
    brand: string | null;
    threat_types: string[];
  }): Promise<void> {
    const { error } = await supabase
      .from('scan_results')
      .insert([data]);

    if (error) {
      console.error('Error saving scan result:', error);
      throw error;
    }
  }

  async getScanResults(): Promise<ScanResult[]> {
    const { data, error } = await supabase
      .from('scan_results')
      .select('*')
      .order('scan_date', { ascending: false });

    if (error) {
      console.error('Error fetching scan results:', error);
      throw error;
    }

    return data || [];
  }

  async getBrandStats(): Promise<{ brand: string; count: number }[]> {
    const { data, error } = await supabase
      .from('scan_results')
      .select('brand')
      .not('brand', 'is', null);

    if (error) {
      console.error('Error fetching brand stats:', error);
      return [];
    }

    const brandCounts = (data || []).reduce((acc: Record<string, number>, item) => {
      const brand = item.brand;
      if (brand) {
        acc[brand] = (acc[brand] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(brandCounts).map(([brand, count]) => ({
      brand,
      count: count as number,
    }));
  }
}

export const databaseService = new DatabaseService();
