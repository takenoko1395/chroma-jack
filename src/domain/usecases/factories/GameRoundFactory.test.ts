import { describe, expect, it } from 'vitest';
import { FixedRandomSource } from '../../../test/helpers/FixedRandomSource';
import { createRoundNumber } from '../../../test/helpers/createDomainValue';
import { GameRules } from '../../models/rules/GameRules';
import { GameDeckFactory } from './GameDeckFactory';
import { GameRoundFactory } from './GameRoundFactory';

describe('GameRoundFactory', () => {
  it('初期Handと公開候補を持つラウンド開始状態を生成する', () => {
    const rules = GameRules.classic();
    const randomSource = new FixedRandomSource([10]);
    const factory = new GameRoundFactory(
      randomSource,
      new GameDeckFactory(randomSource),
    );

    const round = factory.create({
      rules,
      roundNumber: createRoundNumber(3),
    });

    expect(round.roundNumber.value).toBe(3);
    expect(
      Object.values(round.hand.color).every(
        (channel) =>
          channel >= rules.initialColorRange.minimum &&
          channel <= rules.initialColorRange.maximum,
      ),
    ).toBe(true);
    expect(round.offeredCards).toHaveLength(rules.cardOfferSize.value);
    expect(round.offeredCards.length + round.remainingDeck.length).toBe(
      rules.deckSize,
    );
  });
});
