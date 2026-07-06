import { describe, expect, it } from 'vitest';
import { chatReducer, initialChatState, type ChatState } from './chat-reducer';

function streamStart(): ChatState {
  const s = chatReducer(initialChatState, { type: 'send', prompt: 'hi' });
  return s;
}

describe('chatReducer', () => {
  it('send appends user msg + empty streaming assistant msg', () => {
    const s = streamStart();
    expect(s.messages).toHaveLength(2);
    expect(s.messages[0]).toMatchObject({ role: 'user', text: 'hi' });
    expect(s.messages[1]).toMatchObject({ role: 'assistant', text: '' });
    expect(s.status).toBe('streaming');
  });
  it('delta accumulates text on the last assistant message', () => {
    let s = streamStart();
    s = chatReducer(s, { type: 'delta', text: 'Hello ' });
    s = chatReducer(s, { type: 'delta', text: 'world' });
    expect(s.messages[1].text).toBe('Hello world');
  });
  it('metadata merges cards and followUps', () => {
    let s = streamStart();
    s = chatReducer(s, { type: 'metadata', cards: [{ type: 'result', id: 'r', title: 't', stats: [] }], followUps: ['next?'] });
    expect(s.messages[1].cards).toHaveLength(1);
    expect(s.messages[1].followUps).toEqual(['next?']);
  });
  it('progress updates stage/ratio; done finalizes and clears progress', () => {
    let s = streamStart();
    s = chatReducer(s, { type: 'progress', stage: 'Analyzing responses', ratio: 0.25 });
    expect(s.messages[1].progress).toEqual({ stage: 'Analyzing responses', ratio: 0.25 });
    s = chatReducer(s, { type: 'done' });
    expect(s.status).toBe('idle');
    expect(s.messages[1].progress).toBeUndefined();
    expect(s.messages[1].completedJob).toBe(true);
  });
  it('done without progress leaves completedJob unset', () => {
    let s = streamStart();
    s = chatReducer(s, { type: 'delta', text: 'hi' });
    s = chatReducer(s, { type: 'done' });
    expect(s.status).toBe('idle');
    expect(s.messages[1].completedJob).toBeUndefined();
    expect(s.messages[1].text).toBe('hi');
  });
  it('second send appends a new turn', () => {
    let s = streamStart();
    s = chatReducer(s, { type: 'done' });
    s = chatReducer(s, { type: 'send', prompt: 'again' });
    expect(s.messages).toHaveLength(4);
    expect(s.messages[2]).toMatchObject({ role: 'user', text: 'again' });
    expect(s.messages[3]).toMatchObject({ role: 'assistant', text: '' });
    expect(s.lastPrompt).toBe('again');
  });
  it('stop keeps partial text and marks stopped', () => {
    let s = streamStart();
    s = chatReducer(s, { type: 'delta', text: 'partial' });
    s = chatReducer(s, { type: 'stop' });
    expect(s.messages[1].text).toBe('partial');
    expect(s.messages[1].stopped).toBe(true);
    expect(s.status).toBe('idle');
  });
  it('error records message and lastPrompt enables retry', () => {
    let s = streamStart();
    s = chatReducer(s, { type: 'error', message: 'network' });
    expect(s.status).toBe('error');
    expect(s.lastPrompt).toBe('hi');
    expect(s.messages[1].error).toBe('network');
  });
  it('canvas open/close', () => {
    let s = chatReducer(initialChatState, { type: 'open_canvas', cardId: 'churn-billing' });
    expect(s.canvasCardId).toBe('churn-billing');
    s = chatReducer(s, { type: 'close_canvas' });
    expect(s.canvasCardId).toBeNull();
  });
});
