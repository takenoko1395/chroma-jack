import { describe, expect, it } from 'vitest';
import { GameRules } from './GameRules';
import { ScoreTarget } from './ScorePolicy';
import {
  createColor,
  createGameRuleId,
} from '../../../test/helpers/createDomainValue';
import { CardOfferSize } from './CardOfferSize';

describe('GameRules', () => {
  it('RGB加算は黒から白、CMY減算は白から黒を目標にする', () => {
    const rgb = GameRules.classic();
    const cmy = GameRules.cmySubtractive();

    expect(rgb.initialColor).toMatchObject({ red: 0, green: 0, blue: 0 });
    expect(rgb.scorePolicy.target).toBe(ScoreTarget.White);
    expect(cmy.initialColor).toMatchObject({
      red: 255,
      green: 255,
      blue: 255,
    });
    expect(cmy.scorePolicy.target).toBe(ScoreTarget.Black);
  });

  it('オブジェクト引数から各設定を名前どおり保持する', () => {
    const rules = GameRules.clampChallenge();

    expect(rules.id.value).toBe('clamp-challenge');
    expect(rules.totalRounds).toBe(5);
    expect(rules.deckSize).toBe(24);
    expect(rules.cardOfferSize.value).toBe(3);
    expect(rules.initialColor).toMatchObject({ red: 0, green: 0, blue: 0 });
    expect(rules.colorDeckPolicy.dominantChannelRange.maximum).toBe(120);
    expect(rules.overflowPolicy.allowedBurstColors).toBe(1);
    expect(rules.scorePolicy.clampPenalty).toBe(200);
  });

  it('Handの上限を超える初期色を拒否する', () => {
    const base = GameRules.classic();

    expect(
      () =>
        new GameRules({
          ...base,
          id: createGameRuleId('invalid-initial-color'),
          initialColor: createColor(256, 0, 0),
        }),
    ).toThrow(RangeError);
  });

  it('候補枚数が山札枚数を超える設定を拒否する', () => {
    const base = GameRules.classic();
    const oversizedOffer = CardOfferSize.create(base.deckSize + 1);
    expect(oversizedOffer).toBeInstanceOf(CardOfferSize);
    if (!(oversizedOffer instanceof CardOfferSize)) return;

    expect(
      () =>
        new GameRules({
          ...base,
          id: createGameRuleId('invalid-offer-size'),
          cardOfferSize: oversizedOffer,
        }),
    ).toThrow(RangeError);
  });

  it('3で割り切れない山札枚数も許可する', () => {
    const base = GameRules.classic();

    const rules = new GameRules({
      ...base,
      id: createGameRuleId('ten-card-deck'),
      deckSize: 10,
    });

    expect(rules.deckSize).toBe(10);
  });
});
