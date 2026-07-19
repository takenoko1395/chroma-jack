import { describe, expect, it } from 'vitest';
import { Color } from '../color/Color';
import { Hand } from '../hand/Hand';
import { GameScore } from './GameScore';
import type { RoundResult } from './Round';

describe('GameScore', () => {
  it('各ラウンドのスコアを合計する', () => {
    const color = Color.create(10, 10, 10);
    expect(color).toBeInstanceOf(Color);
    if (!(color instanceof Color)) return;
    const hand = new Hand(color);
    const results: RoundResult[] = [
      {
        rulesId: 'test',
        roundNumber: 1,
        finalHand: hand,
        burstHand: null,
        score: 100,
        endReason: 'stood',
      },
      {
        rulesId: 'test',
        roundNumber: 2,
        finalHand: hand,
        burstHand: hand,
        score: 0,
        endReason: 'burst',
      },
    ];

    expect(GameScore.calculate(results).value).toBe(100);
  });
});
