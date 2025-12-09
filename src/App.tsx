import { useState } from 'react';
import { Search, AlertCircle, ExternalLink, Database, Image as ImageIcon } from 'lucide-react';
import { URLQueryService } from './services/urlquery';
import { ThreatTypeSelector } from './components/ThreatTypeSelector';
import { ScreenshotModal } from './components/ScreenshotModal';
import Dashboard from './components/Dashboard';
import { THREAT_TYPES } from './constants/threatTypes';
import type { URLQuerySearchResult, ThreatType } from './types/urlquery';

function App() {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_URLQUERY_API_KEY || '');
  const [threatType, setThreatType] = useState<ThreatType>('phishing');
  const [customQuery, setCustomQuery] = useState('tags:phishing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<URLQuerySearchResult[]>([]);
  const [resultCount, setResultCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<{ url: string; title: string } | null>(null);

  const getCurrentQuery = () => {
    if (threatType === 'custom') {
      return customQuery;
    }
    const selected = THREAT_TYPES.find(t => t.value === threatType);
    return selected?.query || 'tags:phishing';
  };

  const handlePull = async () => {
    const query = getCurrentQuery();

    if (!query.trim()) {
      setError('Search query is required');
      return;
    }

    if (!apiKey.trim()) {
      setError('URLQuery API key is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(false);

    const urlQueryService = new URLQueryService(apiKey.trim());
    const response = await urlQueryService.searchReports(query.trim());

    setLoading(false);
    setHasSearched(true);

    if (!response.ok) {
      setError(response.error || 'Failed to fetch reports');
      return;
    }

    setResults(response.results);
    setResultCount(response.count);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePull();
    }
  };

  const openScreenshot = (screenshotUrl: string, title: string) => {
    setSelectedScreenshot({ url: screenshotUrl, title });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Database className="w-10 h-10 text-cyan-400" />
            <h1 className="text-5xl font-bold text-white tracking-tight">
              ZERPLOIT
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            OSINT Interface for URLQuery.net Reports
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Investigate phishing campaigns and malicious URLs with visual analysis
          </p>
        </div>

        {hasSearched && results.length > 0 && (
          <div className="mb-8">
            <Dashboard results={results} />
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="mb-6">
            <label
              htmlFor="api-key-input"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              URLQuery API Key
            </label>
            <input
              id="api-key-input"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your URLQuery.net API key"
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed mb-1"
            />
            <p className="text-slate-500 text-xs mt-1">
              Get your API key from <a href="https://urlquery.net" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">urlquery.net</a>
            </p>
          </div>

          <ThreatTypeSelector
            selected={threatType}
            onChange={setThreatType}
            disabled={loading}
          />

          {threatType === 'custom' && (
            <div className="mb-6">
              <label
                htmlFor="custom-query-input"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Custom Search Query
              </label>
              <input
                id="custom-query-input"
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., tags:phishing, domain:example.com"
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          )}

          <div className="mb-6">
            <button
              id="pull-btn"
              onClick={handlePull}
              disabled={loading}
              className="w-full px-8 py-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/50 text-lg"
            >
              <Search className="w-6 h-6" />
              {loading ? 'Searching...' : 'Pull Threat Intelligence'}
            </button>
          </div>

          {error && (
            <div
              id="status"
              className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-red-200">{error}</div>
            </div>
          )}

          {loading && (
            <div id="status" className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 mt-4">Pulling reports from URLQuery.net...</p>
            </div>
          )}

          {!loading && hasSearched && !error && (
            <div id="status" className="mb-6 p-4 bg-cyan-900/30 border border-cyan-700 rounded-lg">
              <p className="text-cyan-200">
                Found <span className="font-bold">{resultCount}</span> result(s) for "{getCurrentQuery()}"
              </p>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && !error && (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No results found for "{getCurrentQuery()}"</p>
              <p className="text-slate-500 text-sm mt-2">Try a different search query or threat type</p>
            </div>
          )}

          {results.length > 0 && (
            <div id="results" className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.report_id}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-5 hover:border-slate-600 transition-all"
                >
                  <div className="flex gap-5">
                    <div className="flex-shrink-0">
                      <div
                        className="w-32 h-24 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 cursor-pointer hover:border-cyan-500 transition-colors group relative"
                        onClick={() => result.screenshotUrl && openScreenshot(result.screenshotUrl, result.title || result.url)}
                      >
                        {result.screenshotUrl ? (
                          <>
                            <img
                              src={result.screenshotUrl}
                              alt={`Screenshot of ${result.title || result.url}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.classList.add('flex', 'items-center', 'justify-center');
                                  const icon = document.createElement('div');
                                  icon.innerHTML = '<svg class="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                  parent.appendChild(icon);
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="w-8 h-8 text-slate-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <div className="text-white font-medium break-all mb-1">
                          {result.url || result.domain}
                        </div>
                        {result.domain && result.url && result.domain !== result.url && (
                          <div className="text-slate-400 text-sm">
                            Domain: {result.domain}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {result.tags && result.tags.length > 0 ? (
                          result.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-cyan-900/50 text-cyan-300 text-xs rounded border border-cyan-700"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-sm">No tags</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-3">
                        {result.report_date && (
                          <div>
                            <span className="text-slate-500">Scanned:</span> {new Date(result.report_date).toLocaleString()}
                          </div>
                        )}
                        {result.score !== undefined && (
                          <div>
                            <span className="text-slate-500">Score:</span> {result.score}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <a
                          href={`https://urlquery.net/report/${result.report_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded transition-colors"
                        >
                          View Report
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>Powered by URLQuery.net Public API</p>
        </div>
      </div>

      {selectedScreenshot && (
        <ScreenshotModal
          screenshotUrl={selectedScreenshot.url}
          title={selectedScreenshot.title}
          onClose={() => setSelectedScreenshot(null)}
        />
      )}
    </div>
  );
}

export default App;
