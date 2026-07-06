import type { Card, CanvasDetail, ScenarioEvent } from './types';

export interface Scenario { id: 'churn' | 'concept' | 'default'; events: readonly ScenarioEvent[]; }

export const STARTER_PROMPTS = ["What's driving churn?", 'Run a concept test'] as const;

const d = (text: string, delayMs = 45): ScenarioEvent => ({ event: 'delta', data: { text }, delayMs });

const CHURN_CARDS: Card[] = [
  { type: 'recommendation', id: 'churn-onboarding', title: 'Fix week-1 onboarding drop', body: 'Users who skip the setup checklist churn 3.1× more. Prioritize a guided first-run flow.', metric: '3.1× churn risk' },
  { type: 'recommendation', id: 'churn-billing', title: 'Soften the trial→paid cliff', body: 'A large churn spike lands on the first invoice. Consider usage-based ramp pricing.', metric: '38% of churn' },
];

const churnDeltas = `Looking at the last 90 days of (synthetic) usage data, churn concentrates in two moments: the first week, and the first invoice. Week-1 users who never complete setup rarely activate — they account for the largest recoverable segment. The second spike is billing shock at trial end. Below are the two highest-leverage fixes, ranked by estimated impact.`
  .split(/(?<= )/); // split into words, keeping trailing spaces

const CHURN_EVENTS: ScenarioEvent[] = [
  ...churnDeltas.map((t) => d(t)),
  { event: 'metadata', data: { cards: CHURN_CARDS, followUps: ['Show retention by cohort', 'Run a concept test'] }, delayMs: 200 },
  { event: 'done', data: {}, delayMs: 80 },
];

const RESULT_CARD: Card = {
  type: 'result', id: 'concept-result', title: 'Concept test — synthetic panel (n=200)',
  stats: [
    { label: 'Purchase intent', value: '62%' },
    { label: 'Uniqueness', value: '71%' },
    { label: 'Price acceptance', value: '$29–39' },
  ],
};

const CONCEPT_EVENTS: ScenarioEvent[] = [
  d('Kicking off a synthetic concept test across 200 personas. This usually takes a moment — live progress below.', 30),
  { event: 'progress', data: { stage: 'Analyzing responses', ratio: 0.25 }, delayMs: 900 },
  { event: 'progress', data: { stage: 'Segmenting audience', ratio: 0.6 }, delayMs: 1400 },
  { event: 'progress', data: { stage: 'Scoring concepts', ratio: 0.9 }, delayMs: 1400 },
  d(' Done — the concept scores well on intent and uniqueness; price sensitivity clusters just under $40.', 300),
  { event: 'metadata', data: { cards: [RESULT_CARD], followUps: ["What's driving churn?"] }, delayMs: 150 },
  { event: 'done', data: {}, delayMs: 80 },
];

const DEFAULT_EVENTS: ScenarioEvent[] = [
  d('(Demo) This playground answers two scripted questions — try the suggestion chips below. Here is a sample analysis instead. ', 30),
  ...CHURN_EVENTS,
];

export const CANVAS_DETAILS: Record<string, CanvasDetail> = {
  'churn-onboarding': {
    title: 'Week-1 onboarding drop', summary: 'Setup-checklist completion vs. 90-day retention (synthetic cohort).',
    chart: [ { label: 'Completed setup', value: 82 }, { label: 'Partial setup', value: 54 }, { label: 'Skipped setup', value: 26 } ],
  },
  'churn-billing': {
    title: 'Trial→paid conversion cliff', summary: 'Churn events by lifecycle moment (synthetic).',
    chart: [ { label: 'Week 1', value: 31 }, { label: 'First invoice', value: 38 }, { label: 'Months 2+', value: 31 } ],
  },
  'concept-result': {
    title: 'Concept test breakdown', summary: 'Scores across 200 synthetic panelists.',
    chart: [ { label: 'Intent', value: 62 }, { label: 'Uniqueness', value: 71 }, { label: 'Clarity', value: 58 } ],
  },
};

export function matchScenario(prompt: string): Scenario {
  const p = prompt.toLowerCase();
  if (p.includes('churn')) return { id: 'churn', events: CHURN_EVENTS };
  if (p.includes('concept')) return { id: 'concept', events: CONCEPT_EVENTS };
  return { id: 'default', events: DEFAULT_EVENTS };
}
