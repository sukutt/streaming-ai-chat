'use client';
import type { Card } from '@/lib/types';

export function RecommendationCard({ card, onOpen }: { card: Extract<Card, { type: 'recommendation' }>; onOpen: (id: string) => void }) {
  return (
    <button type="button" onClick={() => onOpen(card.id)}
      className="w-full rounded-xl border border-blue-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-semibold text-slate-900">{card.title}</h4>
        {card.metric && <span className="whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{card.metric}</span>}
      </div>
      <p className="mt-1 text-sm text-slate-600">{card.body}</p>
      <span className="mt-2 inline-block text-xs font-medium text-blue-600">View detail →</span>
    </button>
  );
}
