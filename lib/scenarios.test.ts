import { describe, expect, it } from 'vitest';
import { matchScenario, STARTER_PROMPTS, CANVAS_DETAILS } from './scenarios';

describe('matchScenario', () => {
  it('matches churn scenario case-insensitively', () => {
    expect(matchScenario("What's Driving CHURN?").id).toBe('churn');
  });
  it('matches concept-test scenario', () => {
    expect(matchScenario('run a concept test').id).toBe('concept');
  });
  it('falls back to demo-prefixed default', () => {
    const s = matchScenario('hello there');
    expect(s.id).toBe('default');
    const firstDelta = s.events.find((e) => e.event === 'delta');
    expect(firstDelta && 'text' in firstDelta.data && firstDelta.data.text).toMatch(/^\(Demo\)/);
  });
  it('exposes two starter prompts that hit real scenarios', () => {
    expect(STARTER_PROMPTS).toHaveLength(2);
    expect(matchScenario(STARTER_PROMPTS[0]).id).toBe('churn');
    expect(matchScenario(STARTER_PROMPTS[1]).id).toBe('concept');
  });
  it('every recommendation card id has canvas detail data', () => {
    const cards = matchScenario('churn').events
      .filter((e) => e.event === 'metadata')
      .flatMap((e) => ('cards' in e.data ? e.data.cards : []));
    for (const c of cards) expect(CANVAS_DETAILS[c.id]).toBeDefined();
  });
});
