import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import PieChart from './PieChart';
import { getTagColor } from '../constants/threatTypes';
import type { URLQuerySearchResult } from '../types/urlquery';

interface DashboardProps {
  results: URLQuerySearchResult[];
}

export default function Dashboard({ results }: DashboardProps) {
  const tagStats = useMemo(() => {
    const tagCounts: Record<string, number> = {};

    results.forEach(result => {
      if (result.tags && result.tags.length > 0) {
        result.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({
        tag,
        count,
        color: getTagColor(tag),
      }))
      .sort((a, b) => b.count - a.count);
  }, [results]);

  const chartData = tagStats.map(stat => ({
    label: stat.tag,
    value: stat.count,
    color: stat.color,
  }));

  const totalTags = tagStats.reduce((sum, stat) => sum + stat.count, 0);

  if (results.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-8">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <BarChart3 className="w-16 h-16 text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Data Yet</h3>
          <p className="text-slate-500">
            Pull threat intelligence to see threat distribution
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-cyan-500 rounded-full"></div>
          <div>
            <h2 className="text-3xl font-bold text-white">
              Cyber Threat Console
            </h2>
            <p className="text-cyan-400/80 text-sm mt-1">
              {results.length} threat{results.length !== 1 ? 's' : ''} analyzed
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-cyan-500/20 p-6 max-w-2xl mx-auto">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-1">Tag Distribution</h3>
          <p className="text-xs text-cyan-400/60 uppercase tracking-wider">
            Top Threat Categories
          </p>
        </div>
        {tagStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BarChart3 className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">No tags found</p>
          </div>
        ) : (
          <>
            <PieChart data={chartData} />
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
                Statistics
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Total Tags:</span>
                  <span className="text-white font-bold">{totalTags}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Unique:</span>
                  <span className="text-white font-bold">{tagStats.length}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Most Common:</span>
                  <span className="text-cyan-400 font-bold truncate ml-2">
                    {tagStats[0]?.tag || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
