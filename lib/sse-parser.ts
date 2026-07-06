import type { SseEvent } from './types';

const KNOWN = new Set(['delta', 'metadata', 'progress', 'done', 'error']);

export function createSseParser() {
  let buffer = '';
  return {
    push(chunk: string): SseEvent[] {
      buffer += chunk;
      const events: SseEvent[] = [];
      let idx: number;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        let event = '';
        let data = '';
        for (const line of block.split('\n')) {
          if (line.startsWith('event: ')) event = line.slice(7).trim();
          else if (line.startsWith('data: ')) data = line.slice(6);
        }
        if (!KNOWN.has(event)) continue;
        try {
          events.push({ event, data: JSON.parse(data) } as SseEvent);
        } catch {
          // malformed data — skip silently per spec
        }
      }
      return events;
    },
  };
}
