/*
  # Create scan results and analytics tables

  1. New Tables
    - `scan_results`
      - `id` (uuid, primary key) - Unique identifier for each scan
      - `url` (text) - The URL that was scanned
      - `report_id` (text) - URLQuery report ID
      - `tags` (jsonb) - Array of detected tags/threats
      - `brand` (text) - Detected brand (Microsoft, Netflix, etc.)
      - `threat_types` (jsonb) - Array of threat type categories
      - `scan_date` (timestamptz) - When the scan was performed
      - `created_at` (timestamptz) - Record creation timestamp
      - `user_id` (uuid, nullable) - Optional user tracking for future auth
  
  2. Security
    - Enable RLS on `scan_results` table
    - Add policy for public read access (since auth is not implemented yet)
    - Add policy for public insert access
  
  3. Indexes
    - Index on `brand` for fast filtering
    - Index on `scan_date` for time-based queries
    - GIN index on `tags` for JSONB queries
*/

CREATE TABLE IF NOT EXISTS scan_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  report_id text NOT NULL,
  tags jsonb DEFAULT '[]'::jsonb,
  brand text,
  threat_types jsonb DEFAULT '[]'::jsonb,
  scan_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  user_id uuid
);

ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON scan_results
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON scan_results
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_scan_results_brand ON scan_results(brand);
CREATE INDEX IF NOT EXISTS idx_scan_results_scan_date ON scan_results(scan_date);
CREATE INDEX IF NOT EXISTS idx_scan_results_tags ON scan_results USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_scan_results_threat_types ON scan_results USING GIN (threat_types);