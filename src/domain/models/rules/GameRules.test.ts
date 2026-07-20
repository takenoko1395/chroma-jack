import { describe, expect, it } from 'vitest';
import { IntegerRange } from '../shared/IntegerRange';
import { GameRules } from './GameRules';

describe('GameRules', () => {
  it('オブジェクト引数から各設定を名前どおり保持する', () => {
    const rules = GameRules.clampChallenge();

    expect(rules.id).toBe('clamp-challenge');
    expect(rules.totalRounds).toBe(5);
    expect(rules.deckSize).toBe(12);
    expect(rules.initialColorRange.maximum).toBe(159);
    expect(rules.cardColorRange.maximum).toBe(63);
    expect(rules.overflowPolicy.allowedBurstColors).toBe(1);
    expect(rules.scorePolicy.clampPenalty).toBe(400);
  });

  it('黒以外のカードを生成できない範囲を拒否する', () => {
    const base = GameRules.classic();
    const blackOnlyRange = IntegerRange.create(0, 0);
    expect(blackOnlyRange).toBeInstanceOf(IntegerRange);
    if (!(blackOnlyRange instanceof IntegerRange)) return;

    expect(
      () =>
        new GameRules({
          id: 'invalid',
          totalRounds: base.totalRounds,
          deckSize: base.deckSize,
          initialColorRange: base.initialColorRange,
          cardColorRange: blackOnlyRange,
          initialColorGenerationPolicy: base.initialColorGenerationPolicy,
          cardColorGenerationPolicy: base.cardColorGenerationPolicy,
          overflowPolicy: base.overflowPolicy,
          scorePolicy: base.scorePolicy,
        }),
    ).toThrow(RangeError);
  });
});
