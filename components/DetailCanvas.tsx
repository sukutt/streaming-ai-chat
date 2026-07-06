'use client';
import { CANVAS_DETAILS } from '@/lib/scenarios';

export function DetailCanvas({ cardId, onClose }: { cardId: string; onClose: () => void }) {
  const detail = CANVAS_DETAILS[cardId];
  if (!detail) return null;
  const max = Math.max(...detail.chart.map((c) => c.value));
  return (
    <aside className="flex h-full w-full flex-col border-l border-slate-200 bg-slate-50 p-6">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="font-semibold text-slate-900">{detail.title}</h3>
        <button type="button" onClick={onClose} aria-label="Close detail panel" className="text-slate-400 hover:text-slate-700">✕</button>
      </div>
      <p className="mb-6 text-sm text-slate-600">{detail.summary}</p>
      <svg viewBox="0 0 300 150" role="img" aria-label={`Bar chart: ${detail.title}`} className="w-full">
        {detail.chart.map((c, i) => {
          const w = (c.value / max) * 190;
          const y = 14 + i * 46;
          return (
            <g key={c.label}>
              <text x="0" y={y} fontSize="11" fill="#475569">{c.label}</text>
              <rect x="0" y={y + 6} width={w} height="12" rx="4" fill="#2563eb" />
              <text x={w + 8} y={y + 16} fontSize="11" fill="#475569">{c.value}</text>
            </g>
          );
        })}
      </svg>
      <p className="mt-auto pt-6 text-xs text-slate-400">Synthetic demo data</p>
    </aside>
  );
}
