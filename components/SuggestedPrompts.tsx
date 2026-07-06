'use client';
export function SuggestedPrompts({ prompts, onPick, disabled }: { prompts: readonly string[]; onPick: (p: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((p) => (
        <button key={p} type="button" disabled={disabled} onClick={() => onPick(p)}
          className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-40">
          {p}
        </button>
      ))}
    </div>
  );
}
