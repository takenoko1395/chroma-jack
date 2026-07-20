import { describe, expect, it } from 'vitest';
import { GameCard } from '../card/GameCard';
import { Color } from '../color/Color';
import { Hand } from '../hand/Hand';
import { OverflowPolicy } from '../rules/OverflowPolicy';
import { GameRound, GameRoundActionStatus } from './GameRound';

// テスト用の通常加算カードを生成する。
function createCard(
  id: string,
  red: number,
  green: number,
  blue: number,
): GameCard {
  const card = GameCard.createAddColor(id, red, green, blue);
  if (!(card instanceof GameCard)) throw new Error('Invalid test card');
  return card;
}

// 指定した候補と山札を持つテスト用ラウンドを生成する。
function createRound(
  offeredCards: readonly GameCard[],
  remainingDeck: readonly GameCard[],
): GameRound {
  const color = Color.create(10, 10, 10);
  if (!(color instanceof Color)) throw new Error('Invalid test color');
  return new GameRound({
    roundNumber: 1,
    hand: new Hand(color),
    offeredCards,
    remainingDeck,
  });
}

describe('GameRound', () => {
  it('選択したカードの効果だけを適用し、未選択候補を捨てて次候補を公開する', () => {
    const selected = createCard('selected', 5, 0, 0);
    const next = createCard('next', 1, 1, 1);
    const round = createRound(
      [
        selected,
        createCard('discarded-1', 0, 5, 0),
        createCard('discarded-2', 0, 0, 5),
      ],
      [next],
    );

    const action = round.playCard({
      cardId: selected.id,
      overflowPolicy: OverflowPolicy.classic(),
      cardOfferSize: 3,
    });

    expect(action.status).toBe(GameRoundActionStatus.Continued);
    expect(action.round.hand.color).toMatchObject({
      red: 15,
      green: 10,
      blue: 10,
    });
    expect(action.round.offeredCards.map((card) => card.id)).toEqual(['next']);
  });

  it('候補にないカードIDではラウンドを変更しない', () => {
    const round = createRound([createCard('offered', 1, 1, 1)], []);
    const action = round.playCard({
      cardId: 'missing',
      overflowPolicy: OverflowPolicy.classic(),
      cardOfferSize: 1,
    });

    expect(action.status).toBe(GameRoundActionStatus.CardNotOffered);
    expect(action.round).toBe(round);
  });

  it('最後の候補を適用すると山札切れを返す', () => {
    const round = createRound([createCard('last', 1, 1, 1)], []);
    const action = round.playCard({
      cardId: 'last',
      overflowPolicy: OverflowPolicy.classic(),
      cardOfferSize: 1,
    });

    expect(action.status).toBe(GameRoundActionStatus.DeckExhausted);
    expect(action.round.hand.color).toMatchObject({
      red: 11,
      green: 11,
      blue: 11,
    });
  });
});
