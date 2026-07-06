'use client';
import { useEffect, useRef, useState } from 'react';
import { useChatStream } from '@/lib/use-chat-stream';
import { STARTER_PROMPTS } from '@/lib/scenarios';
import { SuggestedPrompts } from './SuggestedPrompts';
import { ProgressBar } from './ProgressBar';
import { RecommendationCard } from './cards/RecommendationCard';
import { ResultCard } from './cards/ResultCard';
import { DetailCanvas } from './DetailCanvas';

export function ChatShell() {
  const { state, dispatch, send, stop, retry } = useChatStream();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const streaming = state.status === 'streaming';

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [state.messages]);

  const submit = (prompt: string) => { void send(prompt); setInput(''); };
  const openCanvas = (cardId: string) => dispatch({ type: 'open_canvas', cardId });

  return (
    <div className="relative flex h-dvh">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
          <span className="font-bold text-slate-900">Streaming AI Chat <span className="text-blue-600">Demo</span></span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">Demo · mock data</span>
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-5">
            {state.messages.length === 0 && (
              <div className="mt-16 text-center">
                <h1 className="mb-2 text-2xl font-bold text-slate-900">Ask the research assistant</h1>
                <p className="mb-6 text-sm text-slate-500">Scripted demo of a streaming (SSE) AI chat — no real LLM behind it.</p>
                <div className="flex justify-center"><SuggestedPrompts prompts={STARTER_PROMPTS} onPick={submit} /></div>
              </div>
            )}
            {state.messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'self-end' : 'self-stretch'}>
                {m.role === 'user' ? (
                  <div className="rounded-2xl rounded-br-md bg-blue-600 px-4 py-2.5 text-white">{m.text}</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {m.text && (
                      <p className="whitespace-pre-wrap leading-relaxed text-slate-700">
                        {m.text}
                        {streaming && i === state.messages.length - 1 && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-blue-600 align-middle" />}
                      </p>
                    )}
                    {m.progress && <ProgressBar stage={m.progress.stage} ratio={m.progress.ratio} completed={false} />}
                    {m.completedJob && <ProgressBar stage="Done" ratio={1} completed />}
                    {m.cards?.map((c) =>
                      c.type === 'recommendation'
                        ? <RecommendationCard key={c.id} card={c} onOpen={openCanvas} />
                        : <ResultCard key={c.id} card={c} onOpen={openCanvas} />
                    )}
                    {m.followUps && !streaming && <SuggestedPrompts prompts={m.followUps} onPick={submit} />}
                    {m.stopped && <span className="w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">stopped</span>}
                    {m.error && (
                      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        Something went wrong ({m.error}).
                        <button type="button" onClick={retry} className="font-semibold underline">Retry</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </main>
        <footer className="border-t border-slate-200 p-4">
          <form className="mx-auto flex max-w-2xl gap-2" onSubmit={(e) => { e.preventDefault(); if (!streaming) submit(input); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder='Try "What&apos;s driving churn?"'
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-slate-800 outline-none focus:border-blue-400" />
            {streaming
              ? <button type="button" onClick={stop} className="rounded-xl border border-slate-300 px-5 font-medium text-slate-600 hover:border-slate-500">Stop</button>
              : <button type="submit" className="rounded-xl bg-blue-600 px-5 font-medium text-white hover:bg-blue-700 disabled:opacity-40" disabled={!input.trim()}>Send</button>}
          </form>
        </footer>
      </div>
      {state.canvasCardId && (
        <div className="w-full max-w-sm max-lg:absolute max-lg:inset-y-0 max-lg:right-0 max-lg:z-10 max-lg:shadow-2xl">
          <DetailCanvas cardId={state.canvasCardId} onClose={() => dispatch({ type: 'close_canvas' })} />
        </div>
      )}
    </div>
  );
}
