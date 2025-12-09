# URLQuery OSINT Interface

A Vite + React dashboard for exploring URLQuery.net reports. The app lets analysts search by common threat categories or custom queries, proxies requests through Supabase Edge Functions, and provides report screenshots for quick triage.

## Features
- Search URLQuery reports by phishing, malware, scam, or custom queries.
- View key report details (URL, domain, tags, score, scan time).
- Open direct report links on URLQuery.net.
- Fetch report screenshots via a Supabase proxy for safer viewing.

## Prerequisites
- Node.js 18+ and npm.
- A Supabase project (for the edge functions and database table referenced by the app).
- A URLQuery API key (from [https://urlquery.net](https://urlquery.net)).

## Environment variables
Create a `.env` file in the project root (Vite auto-loads it) with:

```bash
VITE_URLQUERY_API_KEY=<your_urlquery_api_key>        # Optional: prefill the UI API key input
VITE_SUPABASE_URL=<your_supabase_project_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
```

The Supabase Edge Functions also expect `URLQUERY_API_KEY` in their environment when deployed (used by `supabase/functions/urlquery-proxy` and `supabase/functions/screenshot-proxy`).

## Install dependencies
```bash
npm install
```

## Run the app locally
```bash
npm run dev
```
Vite will print a local URL (typically http://localhost:5173). Open it in your browser.

### Using the UI
1. Enter your URLQuery API key (prefilled if `VITE_URLQUERY_API_KEY` is set).
2. Choose a threat type preset or switch to **Custom** and enter your own search query.
3. Click **Pull Threat Intelligence** (or press Enter in the custom query field).
4. Browse results, open report links, or click thumbnails to view screenshots in a modal.

## Supabase setup (proxy + database)
The frontend expects Supabase endpoints for secure access to URLQuery and screenshot data.

- Deploy the edge functions from `supabase/functions/urlquery-proxy` and `supabase/functions/screenshot-proxy`. Each function requires the `URLQUERY_API_KEY` secret and will be reachable at `${VITE_SUPABASE_URL}/functions/v1/<function-name>`.
- The `DatabaseService` uses a `scan_results` table to store and read historical scans. Create the table using your preferred method (SQL migration or Supabase UI) with columns matching the fields used in `src/services/database.ts` (`url`, `report_id`, `tags`, `brand`, `threat_types`, `scan_date`).

## Production build and linting
```bash
npm run build    # Create optimized production assets
npm run lint     # ESLint checks
```

## Troubleshooting
- **"URLQuery API key is required"**: Provide a key in the UI or set `VITE_URLQUERY_API_KEY`.
- **Empty or failing requests**: Ensure `VITE_SUPABASE_URL` points to your Supabase project and that the edge functions are deployed with the `URLQUERY_API_KEY` secret.
- **Screenshots missing**: Confirm the `screenshot-proxy` function is live and the provided API key has screenshot access.
