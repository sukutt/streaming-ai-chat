export type Card =
  | { type: 'recommendation'; id: string; title: string; body: string; metric?: string }
  | { type: 'result'; id: string; title: string; stats: { label: string; value: string }[] };

export type SseEvent =
  | { event: 'delta'; data: { text: string } }
  | { event: 'metadata'; data: { cards: Card[]; followUps: string[] } }
  | { event: 'progress'; data: { stage: string; ratio: number } }
  | { event: 'done'; data: Record<string, never> }
  | { event: 'error'; data: { message: string } };

export type ScenarioEvent = SseEvent & { delayMs: number };

export interface CanvasDetail {
  title: string;
  summary: string;
  chart: { label: string; value: number }[];
}
