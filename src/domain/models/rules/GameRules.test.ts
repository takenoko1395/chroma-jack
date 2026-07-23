import { describe, expect, it } from 'vitest';
import { IntegerRange } from '../shared/IntegerRange';
import { GameRules } from './GameRules';
import { ColorDeckMode } from './ColorDeckMode';
import { ScoreTarget } from './ScorePolicy';

describe('GameRules', () => {
  it('RGB加算は白、CMY減算は黒を目標にする', () => {
    const rgb = GameRules.classic();
    const cmy = GameRules.cmySubtractive();

    expect(rgb.colorDeckMode).toBe(ColorDeckMode.BalancedChannels);
    expect(rgb.scorePolicy.target).toBe(ScoreTarget.White);
    expect(cmy.colorDeckMode).toBe(ColorDeckMode.BalancedChannels);
    expect(cmy.scorePolicy.target).toBe(ScoreTarget.Black);
  });

  it('オブジェクト引数から各設定を名前どおり保持する', () => {
    const rules = GameRules.clampChallenge();

    expect(rules.id).toBe('clamp-challenge');
    expect(rules.totalRounds).toBe(5);
    expect(rules.deckSize).toBe(24);
    expect(rules.cardOfferSize).toBe(3);
    expect(rules.initialColorRange.maximum).toBe(159);
    expect(rules.cardColorRange.maximum).toBe(160);
    expect(rules.overflowPolicy.allowedBurstColors).toBe(1);
    expect(rules.scorePolicy.clampPenalty).toBe(200);
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
          cardOfferSize: base.cardOfferSize,
          initialColorRange: base.initialColorRange,
          cardColorRange: blackOnlyRange,
          initialColorGenerationPolicy: base.initialColorGenerationPolicy,
          cardColorGenerationPolicy: base.cardColorGenerationPolicy,
          colorDeckMode: base.colorDeckMode,
          cardTypeDistribution: base.cardTypeDistribution,
          overflowPolicy: base.overflowPolicy,
          scorePolicy: base.scorePolicy,
        }),
    ).toThrow(RangeError);
  });

  it('候補枚数が山札枚数を超える設定を拒否する', () => {
    const base = GameRules.classic();

    expect(
      () =>
        new GameRules({
          id: 'invalid-offer-size',
          totalRounds: base.totalRounds,
          deckSize: base.deckSize,
          cardOfferSize: base.deckSize + 1,
          initialColorRange: base.initialColorRange,
          cardColorRange: base.cardColorRange,
          initialColorGenerationPolicy: base.initialColorGenerationPolicy,
          cardColorGenerationPolicy: base.cardColorGenerationPolicy,
          colorDeckMode: base.colorDeckMode,
          cardTypeDistribution: base.cardTypeDistribution,
          overflowPolicy: base.overflowPolicy,
          scorePolicy: base.scorePolicy,
        }),
    ).toThrow(RangeError);
  });

  it('CMYを同数にできない山札枚数を拒否する', () => {
    const base = GameRules.classic();

    expect(
      () =>
        new GameRules({
          id: 'unbalanced-deck',
          totalRounds: base.totalRounds,
          deckSize: 10,
          cardOfferSize: base.cardOfferSize,
          initialColorRange: base.initialColorRange,
          cardColorRange: base.cardColorRange,
          initialColorGenerationPolicy: base.initialColorGenerationPolicy,
          cardColorGenerationPolicy: base.cardColorGenerationPolicy,
          colorDeckMode: ColorDeckMode.BalancedChannels,
          cardTypeDistribution: base.cardTypeDistribution,
          overflowPolicy: base.overflowPolicy,
          scorePolicy: base.scorePolicy,
        }),
    ).toThrow(RangeError);
  });
});
