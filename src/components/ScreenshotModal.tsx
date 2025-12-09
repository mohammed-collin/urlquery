import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ScreenshotModalProps {
  screenshotUrl: string;
  title: string;
  onClose: () => void;
}

export function ScreenshotModal({ screenshotUrl, title, onClose }: ScreenshotModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] bg-slate-900 rounded-lg shadow-2xl border border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <h3 className="text-white font-medium truncate pr-4">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="overflow-auto max-h-[calc(90vh-4rem)]">
          <img
            src={screenshotUrl}
            alt={title}
            className="w-full h-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23334155" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" font-size="18" fill="%2394a3b8" text-anchor="middle" dy=".3em"%3EScreenshot unavailable%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      </div>
    </div>
  );
}
