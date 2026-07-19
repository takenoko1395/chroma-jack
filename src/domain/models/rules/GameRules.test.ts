import { describe, expect, it } from 'vitest';
import { IntegerRange } from '../shared/IntegerRange';
import { GameRules } from './GameRules';

describe('GameRules', () => {
  it('黒以外のカードを生成できない範囲を拒否する', () => {
    const base = GameRules.classic();
    const blackOnlyRange = IntegerRange.create(0, 0);
    expect(blackOnlyRange).toBeInstanceOf(IntegerRange);
    if (!(blackOnlyRange instanceof IntegerRange)) return;

    expect(
      () =>
        new GameRules(
          'invalid',
          base.totalRounds,
          base.deckSize,
          base.initialColorRange,
          blackOnlyRange,
          base.initialColorGeneration,
          base.cardColorGeneration,
          base.overflow,
          base.scoring,
        ),
    ).toThrow(RangeError);
  });
});
