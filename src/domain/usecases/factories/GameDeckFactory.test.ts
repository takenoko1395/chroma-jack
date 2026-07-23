import { describe, expect, it } from 'vitest';
import { FixedRandomSource } from '../../../test/helpers/FixedRandomSource';
import { createRoundNumber } from '../../../test/helpers/createDomainValue';
import { CardEffectKind } from '../../models/card/effects/CardEffect';
import { GameRules } from '../../models/rules/GameRules';
import { GameDeckFactory } from './GameDeckFactory';

describe('GameDeckFactory', () => {
  it('加算と減算で同じRGB変化量生成を共有する', () => {
    const values = [0, 63, 127, 0];
    const additiveDeck = new GameDeckFactory(
      new FixedRandomSource(values),
    ).create({ rules: GameRules.classic(), roundNumber: createRoundNumber(1) });
    const subtractiveDeck = new GameDeckFactory(
      new FixedRandomSource(values),
    ).create({
      rules: GameRules.cmySubtractive(),
      roundNumber: createRoundNumber(1),
    });

    const additiveAmounts = additiveDeck.map((card) => {
      if (card.effect.kind !== CardEffectKind.AddColor) return null;
      return card.effect.amount;
    });
    const subtractiveAmounts = subtractiveDeck.map((card) => {
      if (card.effect.kind !== CardEffectKind.SubtractColor) return null;
      return card.effect.amount;
    });

    expect(subtractiveAmounts).toEqual(additiveAmounts);
  });

  it('R・G・B系加算カードを同数ずつ含む制約付き山札を生成する', () => {
    const rules = GameRules.classic();
    const deck = new GameDeckFactory(
      new FixedRandomSource([0, 63, 127, 0]),
    ).create({ rules, roundNumber: createRoundNumber(1) });
    const primaryCounts = { red: 0, green: 0, blue: 0 };

    expect(deck).toHaveLength(rules.deckSize);
    deck.forEach((card) => {
      expect(card.effect.kind).toBe(CardEffectKind.AddColor);
      if (card.effect.kind !== CardEffectKind.AddColor) return;
      const amounts = [
        card.effect.amount.red,
        card.effect.amount.green,
        card.effect.amount.blue,
      ];
      const largestAmount = Math.max(...amounts);
      expect(amounts.filter((amount) => amount > 20)).toHaveLength(1);
      if (card.effect.amount.red === largestAmount) {
        primaryCounts.red += 1;
      }
      if (card.effect.amount.green === largestAmount) {
        primaryCounts.green += 1;
      }
      if (card.effect.amount.blue === largestAmount) {
        primaryCounts.blue += 1;
      }
    });

    expect(new Set(Object.values(primaryCounts)).size).toBe(1);
  });

  it('C・M・Y系減算カードを同数ずつ含む制約付き山札を生成する', () => {
    const rules = GameRules.cmySubtractive();
    const deck = new GameDeckFactory(
      new FixedRandomSource([0, 63, 127, 0]),
    ).create({ rules, roundNumber: createRoundNumber(1) });
    const primaryCounts = { cyan: 0, magenta: 0, yellow: 0 };

    deck.forEach((card) => {
      expect(card.effect.kind).toBe(CardEffectKind.SubtractColor);
      if (card.effect.kind !== CardEffectKind.SubtractColor) return;
      const amounts = [
        card.effect.amount.red,
        card.effect.amount.green,
        card.effect.amount.blue,
      ];
      const largestAmount = Math.max(...amounts);
      expect(amounts.filter((amount) => amount > 20)).toHaveLength(1);
      if (card.effect.amount.red === largestAmount) primaryCounts.cyan += 1;
      if (card.effect.amount.green === largestAmount)
        primaryCounts.magenta += 1;
      if (card.effect.amount.blue === largestAmount) primaryCounts.yellow += 1;
    });

    expect(new Set(Object.values(primaryCounts)).size).toBe(1);
  });

  it('カード種類の分布に従って特殊カード山札を生成する', () => {
    const rules = GameRules.specialDeck();
    const deck = new GameDeckFactory(new FixedRandomSource([999])).create({
      rules,
      roundNumber: createRoundNumber(2),
    });

    expect(deck).toHaveLength(rules.deckSize);
    expect(
      deck.every((card) => card.effect.kind === CardEffectKind.PreventBurst),
    ).toBe(true);
    expect(deck[0]?.id.value).toBe('round-2-card-1');
  });
});
