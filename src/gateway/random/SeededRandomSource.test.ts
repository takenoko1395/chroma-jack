import { describe, expect, it } from 'vitest';
import { CardEffectKind } from '../../domain/models/card/effects/CardEffect';
import { GameRules } from '../../domain/models/rules/GameRules';
import { IntegerRange } from '../../domain/models/shared/IntegerRange';
import { GameEngine } from '../../domain/usecases/GameEngine';
import { SeededRandomSource } from './SeededRandomSource';

// シードから生成した初期色と山札を比較可能な値へ変換する。
function createRoundSnapshot(seed: number) {
  const game = new GameEngine(
    GameRules.classic(),
    new SeededRandomSource(seed),
  ).startGame();
  const round = game.currentRound;
  if (round === null) throw new RangeError('A started game must have a round.');
  const deck = [...round.offeredCards, ...round.remainingDeck];
  return {
    initialColor: {
      red: round.hand.color.red,
      green: round.hand.color.green,
      blue: round.hand.color.blue,
    },
    cards: deck.map((card) => {
      if (card.effect.kind !== CardEffectKind.AddColor) {
        return { kind: card.effect.kind };
      }
      return {
        kind: card.effect.kind,
        red: card.effect.amount.red,
        green: card.effect.amount.green,
        blue: card.effect.amount.blue,
      };
    }),
  };
}

describe('SeededRandomSource', () => {
  it('同じシードとルールから同じ初期色と山札を生成する', () => {
    expect(createRoundSnapshot(12345)).toEqual(createRoundSnapshot(12345));
  });

  it('異なるシードから異なる初期色または山札を生成する', () => {
    expect(createRoundSnapshot(12345)).not.toEqual(createRoundSnapshot(54321));
  });

  it('生成値を指定範囲の両端内に収める', () => {
    const source = new SeededRandomSource(0);
    const range = IntegerRange.create(10, 20);

    const values = Array.from({ length: 100 }, () => source.nextInteger(range));

    expect(values.every((value) => value >= 10 && value <= 20)).toBe(true);
  });

  it.each([-1, 0x100000000, 1.5, Number.NaN])(
    '符号なし32bit整数でないシード%sを拒否する',
    (seed) => {
      expect(() => new SeededRandomSource(seed)).toThrow(RangeError);
    },
  );
});
