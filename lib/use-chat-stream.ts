'use client';
import { useCallback, useReducer, useRef } from 'react';
import { chatReducer, initialChatState } from './chat-reducer';
import { createSseParser } from './sse-parser';
import type { SseEvent } from './types';

export function useChatStream() {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    dispatch({ type: 'send', prompt: trimmed });
    const handle = (ev: SseEvent) => {
      if (ev.event === 'delta') dispatch({ type: 'delta', text: ev.data.text });
      else if (ev.event === 'metadata') dispatch({ type: 'metadata', cards: ev.data.cards, followUps: ev.data.followUps });
      else if (ev.event === 'progress') dispatch({ type: 'progress', stage: ev.data.stage, ratio: ev.data.ratio });
      else if (ev.event === 'done') dispatch({ type: 'done' });
      else if (ev.event === 'error') dispatch({ type: 'error', message: ev.data.message });
    };
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed }),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const parser = createSseParser();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const ev of parser.push(decoder.decode(value, { stream: true }))) handle(ev);
      }
      // Flush the decoder in case a multi-byte char straddled the final chunk.
      for (const ev of parser.push(decoder.decode())) handle(ev);
    } catch (err) {
      if (abortRef.current !== ac) return; // stale request — a newer send owns the stream
      if ((err as Error).name === 'AbortError') dispatch({ type: 'stop' });
      else dispatch({ type: 'error', message: (err as Error).message });
    }
  }, []);

  const stop = useCallback(() => abortRef.current?.abort(), []);
  const retry = useCallback(() => { if (state.lastPrompt) void send(state.lastPrompt); }, [send, state.lastPrompt]);

  return { state, dispatch, send, stop, retry };
}
