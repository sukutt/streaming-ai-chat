import type { Card } from './types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  cards?: Card[];
  followUps?: string[];
  progress?: { stage: string; ratio: number };
  completedJob?: boolean;
  stopped?: boolean;
  error?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  status: 'idle' | 'streaming' | 'error';
  lastPrompt: string | null;
  canvasCardId: string | null;
}

export type ChatAction =
  | { type: 'send'; prompt: string }
  | { type: 'delta'; text: string }
  | { type: 'metadata'; cards: Card[]; followUps: string[] }
  | { type: 'progress'; stage: string; ratio: number }
  | { type: 'done' }
  | { type: 'stop' }
  | { type: 'error'; message: string }
  | { type: 'open_canvas'; cardId: string }
  | { type: 'close_canvas' };

export const initialChatState: ChatState = { messages: [], status: 'idle', lastPrompt: null, canvasCardId: null };

function updateLast(state: ChatState, patch: (m: ChatMessage) => ChatMessage): ChatState {
  const messages = state.messages.slice();
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'assistant') return state;
  messages[messages.length - 1] = patch(last);
  return { ...state, messages };
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'send':
      return {
        ...state,
        status: 'streaming',
        lastPrompt: action.prompt,
        messages: [...state.messages, { role: 'user', text: action.prompt }, { role: 'assistant', text: '' }],
      };
    case 'delta':
      return updateLast(state, (m) => ({ ...m, text: m.text + action.text }));
    case 'metadata':
      return updateLast(state, (m) => ({ ...m, cards: action.cards, followUps: action.followUps }));
    case 'progress':
      return updateLast(state, (m) => ({ ...m, progress: { stage: action.stage, ratio: action.ratio } }));
    case 'done':
      return { ...updateLast(state, (m) => (m.progress ? { ...m, progress: undefined, completedJob: true } : m)), status: 'idle' };
    case 'stop':
      return { ...updateLast(state, (m) => ({ ...m, stopped: true })), status: 'idle' };
    case 'error':
      return { ...updateLast(state, (m) => ({ ...m, error: action.message })), status: 'error' };
    case 'open_canvas':
      return { ...state, canvasCardId: action.cardId };
    case 'close_canvas':
      return { ...state, canvasCardId: null };
  }
}
