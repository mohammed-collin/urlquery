import type { ThreatType } from '../types/urlquery';
import { THREAT_TYPES } from '../constants/threatTypes';

interface ThreatTypeSelectorProps {
  selected: ThreatType;
  onChange: (type: ThreatType) => void;
  disabled?: boolean;
}

export function ThreatTypeSelector({ selected, onChange, disabled }: ThreatTypeSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-300 mb-3">
        Threat Type
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {THREAT_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            disabled={disabled}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${selected === type.value
                ? 'border-cyan-500 bg-cyan-900/30 shadow-lg shadow-cyan-500/20'
                : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="font-semibold text-white mb-1">{type.label}</div>
            <div className="text-xs text-slate-400 line-clamp-2">
              {type.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
