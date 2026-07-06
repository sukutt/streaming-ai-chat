'use client';
import type { Card } from '@/lib/types';

export function ResultCard({ card, onOpen }: { card: Extract<Card, { type: 'result' }>; onOpen: (id: string) => void }) {
  return (
    <button type="button" onClick={() => onOpen(card.id)}
      className="w-full rounded-xl border border-blue-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md">
      <h4 className="font-semibold text-slate-900">{card.title}</h4>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        {card.stats.map((s) => (
          <div key={s.label}>
            <dd className="text-lg font-bold text-blue-600">{s.value}</dd>
            <dt className="text-xs text-slate-500">{s.label}</dt>
          </div>
        ))}
      </dl>
      <span className="mt-2 inline-block text-xs font-medium text-blue-600">View detail →</span>
    </button>
  );
}
