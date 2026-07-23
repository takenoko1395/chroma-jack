import { describe, expect, it } from 'vitest';
import { Color } from '../color/Color';
import { ColorChannel } from '../color/ColorChannel';
import { Hand } from '../hand/Hand';
import { GameScore } from './GameScore';
import {
  createRoundNumber,
  createRoundScore,
} from '../../../test/helpers/createDomainValue';
import type { RoundResult } from './Round';

describe('GameScore', () => {
  it('各ラウンドのスコアを合計する', () => {
    const color = Color.create(10, 10, 10);
    expect(color).toBeInstanceOf(Color);
    if (!(color instanceof Color)) return;
    const hand = new Hand(color);
    const results: RoundResult[] = [
      {
        roundNumber: createRoundNumber(1),
        finalHand: hand,
        burstHand: null,
        burstChannels: null,
        score: createRoundScore(100),
        endReason: 'stood',
      },
      {
        roundNumber: createRoundNumber(2),
        finalHand: hand,
        burstHand: hand,
        burstChannels: [ColorChannel.Red],
        score: createRoundScore(0),
        endReason: 'burst',
      },
    ];

    expect(GameScore.calculate(results).value).toBe(100);
  });
});
