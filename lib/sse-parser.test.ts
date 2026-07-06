import { describe, expect, it } from 'vitest';
import { createSseParser } from './sse-parser';

const EV = 'event: delta\ndata: {"text":"hi"}\n\n';

describe('createSseParser', () => {
  it('parses a complete event', () => {
    const p = createSseParser();
    expect(p.push(EV)).toEqual([{ event: 'delta', data: { text: 'hi' } }]);
  });
  it('buffers events split across chunk boundaries', () => {
    const p = createSseParser();
    expect(p.push(EV.slice(0, 14))).toEqual([]);
    expect(p.push(EV.slice(14))).toEqual([{ event: 'delta', data: { text: 'hi' } }]);
  });
  it('parses multiple events in one chunk', () => {
    const p = createSseParser();
    expect(p.push(EV + 'event: done\ndata: {}\n\n')).toHaveLength(2);
  });
  it('skips malformed data without throwing', () => {
    const p = createSseParser();
    expect(p.push('event: delta\ndata: {broken\n\n' + EV)).toEqual([
      { event: 'delta', data: { text: 'hi' } },
    ]);
  });
  it('skips unknown event types', () => {
    const p = createSseParser();
    expect(p.push('event: nope\ndata: {}\n\n')).toEqual([]);
  });
});
