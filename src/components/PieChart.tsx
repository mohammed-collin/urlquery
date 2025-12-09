import { useMemo, useState } from 'react';

interface PieChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  onSegmentClick?: (label: string) => void;
}

export default function PieChart({ data, onSegmentClick }: PieChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const { segments, total, topSegments, otherSegment } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const TOP_COUNT = 6;

    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const topData = sortedData.slice(0, TOP_COUNT);
    const otherData = sortedData.slice(TOP_COUNT);

    const otherValue = otherData.reduce((sum, item) => sum + item.value, 0);

    const chartData = [...topData];
    if (otherValue > 0) {
      chartData.push({
        label: 'Other',
        value: otherValue,
        color: '#64748B',
      });
    }

    let currentAngle = -90;
    const topSegments = chartData.map((item, idx) => {
      const percentage = (item.value / total) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const midAngle = startAngle + (endAngle - startAngle) / 2;

      currentAngle = endAngle;

      return {
        ...item,
        percentage,
        startAngle,
        endAngle,
        midAngle,
        index: idx,
      };
    });

    return {
      segments: data.map((item, idx) => ({
        ...item,
        percentage: (item.value / total) * 100,
        index: idx,
      })),
      total,
      topSegments,
      otherSegment: otherValue > 0 ? {
        label: 'Other',
        value: otherValue,
        percentage: (otherValue / total) * 100,
        tags: otherData,
      } : null,
    };
  }, [data]);

  const createDonutArc = (startAngle: number, endAngle: number, outerRadius: number, innerRadius: number) => {
    const startOuter = polarToCartesian(60, 60, outerRadius, endAngle);
    const endOuter = polarToCartesian(60, 60, outerRadius, startAngle);
    const startInner = polarToCartesian(60, 60, innerRadius, endAngle);
    const endInner = polarToCartesian(60, 60, innerRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', startOuter.x, startOuter.y,
      'A', outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
      'L', endInner.x, endInner.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        No data to display
      </div>
    );
  }

  const hoveredData = hoveredSegment !== null ? topSegments[hoveredSegment] : null;

  return (
    <div className="relative">
      <svg viewBox="0 0 120 120" className="w-full max-w-sm mx-auto drop-shadow-2xl">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9"/>
          </linearGradient>
        </defs>

        <circle cx="60" cy="60" r="50" fill="url(#bgGradient)" opacity="0.3" />

        {topSegments.map((segment, index) => {
          const isHovered = hoveredSegment === index;
          const outerRadius = isHovered ? 48 : 46;
          const innerRadius = 28;

          return (
            <g key={index}>
              <path
                d={createDonutArc(segment.startAngle, segment.endAngle, outerRadius, innerRadius)}
                fill={segment.color}
                stroke="rgba(15, 23, 42, 0.5)"
                strokeWidth="1"
                filter={isHovered ? "url(#glow)" : undefined}
                className="cursor-pointer transition-all duration-300"
                style={{
                  transformOrigin: '50% 50%',
                  opacity: hoveredSegment === null ? 1 : (isHovered ? 1 : 0.5),
                }}
                onClick={() => onSegmentClick?.(segment.label)}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            </g>
          );
        })}

        <circle cx="60" cy="60" r="26" fill="#0f172a" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="1"/>

        <text
          x="60"
          y="54"
          textAnchor="middle"
          className="text-[6px] fill-cyan-400 font-bold uppercase tracking-wider"
          style={{ letterSpacing: '0.1em' }}
        >
          Total
        </text>
        <text
          x="60"
          y="63"
          textAnchor="middle"
          className="text-[12px] fill-white font-bold"
        >
          {total}
        </text>
        <text
          x="60"
          y="69"
          textAnchor="middle"
          className="text-[4px] fill-slate-400 uppercase"
        >
          tags
        </text>
      </svg>

      {hoveredData && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            animation: 'fadeIn 0.2s ease-in',
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur-sm border border-cyan-500/50 rounded-lg px-4 py-3 shadow-2xl">
            <div className="text-xs font-bold text-cyan-400 mb-1 uppercase tracking-wide">
              {hoveredData.label}
            </div>
            <div className="text-lg font-bold text-white">
              {hoveredData.percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400">
              {hoveredData.value} occurrences
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-2">
        {topSegments.map((segment, index) => (
          <button
            key={index}
            className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 transition-all hover:bg-slate-800"
            onClick={() => onSegmentClick?.(segment.label)}
            onMouseEnter={() => setHoveredSegment(index)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{
                backgroundColor: segment.color,
                boxShadow: `0 0 8px ${segment.color}40`
              }}
            />
            <div className="flex-1 text-left min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {segment.label}
              </div>
              <div className="text-[10px] text-slate-400">
                {segment.percentage.toFixed(1)}%
              </div>
            </div>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
