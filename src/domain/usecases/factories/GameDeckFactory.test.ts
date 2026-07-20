import { describe, expect, it } from 'vitest';
import { FixedRandomSource } from '../../test/helpers/FixedRandomSource';
import { CardEffectKind } from '../models/card/effects/CardEffect';
import { GameRules } from '../models/rules/GameRules';
import { GameDeckFactory } from './GameDeckFactory';

describe('GameDeckFactory', () => {
  it('各色が同数ずつ主成分になる制約付き山札を生成する', () => {
    const rules = GameRules.classic();
    const deck = new GameDeckFactory(
      new FixedRandomSource([0, 63, 127, 0]),
    ).create({ rules, roundNumber: 1 });
    const dominantChannelCounts = { red: 0, green: 0, blue: 0 };

    expect(deck).toHaveLength(rules.deckSize);
    deck.forEach((card) => {
      expect(card.effect.kind).toBe(CardEffectKind.AddColor);
      if (card.effect.kind !== CardEffectKind.AddColor) return;
      const largestAmount = Math.max(
        card.effect.amount.red,
        card.effect.amount.green,
        card.effect.amount.blue,
      );
      if (card.effect.amount.red === largestAmount) {
        dominantChannelCounts.red += 1;
      }
      if (card.effect.amount.green === largestAmount) {
        dominantChannelCounts.green += 1;
      }
      if (card.effect.amount.blue === largestAmount) {
        dominantChannelCounts.blue += 1;
      }
    });

    expect(new Set(Object.values(dominantChannelCounts)).size).toBe(1);
  });

  it('カード種類の分布に従って特殊カード山札を生成する', () => {
    const rules = GameRules.specialDeck();
    const deck = new GameDeckFactory(new FixedRandomSource([999])).create({
      rules,
      roundNumber: 2,
    });

    expect(deck).toHaveLength(rules.deckSize);
    expect(
      deck.every((card) => card.effect.kind === CardEffectKind.PreventBurst),
    ).toBe(true);
    expect(deck[0]?.id).toBe('round-2-card-1');
  });
});
