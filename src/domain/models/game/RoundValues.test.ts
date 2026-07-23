import { describe, expect, it } from 'vitest';
import { RoundNumber, RoundNumberCreationFailure } from './RoundNumber';
import { RoundScore, RoundScoreCreationFailure } from './RoundScore';

describe('round value objects', () => {
  it('ラウンド番号を正の整数に制限し、次の番号を生成する', () => {
    expect(RoundNumber.create(0)).toBe(
      RoundNumberCreationFailure.NotPositiveInteger,
    );
    const roundNumber = RoundNumber.create(1);
    expect(roundNumber).toBeInstanceOf(RoundNumber);
    if (!(roundNumber instanceof RoundNumber)) return;
    expect(roundNumber.next().value).toBe(2);
  });

  it('ラウンド得点を0以上の整数に制限する', () => {
    expect(RoundScore.create(-1)).toBe(
      RoundScoreCreationFailure.NotNonNegativeInteger,
    );
    expect(RoundScore.zero().value).toBe(0);
  });
});
