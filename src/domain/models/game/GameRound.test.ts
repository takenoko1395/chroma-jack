import { describe, expect, it } from 'vitest';
import type { GameCard } from '../card/GameCard';
import {
  PreventBurstEffect,
  RevealColorValuesEffect,
} from '../card/effects/RoundModifierEffects';
import { Hand } from '../hand/Hand';
import { GameRules } from '../rules/GameRules';
import {
  createAddColorCard,
  createColor,
  createEffectCard,
  createGameCardId,
  createRoundNumber,
} from '../../../test/helpers/createDomainValue';
import { GameRound, GameRoundActionStatus } from './GameRound';

// テスト用の通常加算カードを生成する。
function createCard(
  id: string,
  red: number,
  green: number,
  blue: number,
): GameCard {
  return createAddColorCard(id, red, green, blue);
}

// 指定した候補と山札を持つテスト用ラウンドを生成する。
function createRound(
  offeredCards: readonly GameCard[],
  remainingDeck: readonly GameCard[],
): GameRound {
  return new GameRound({
    roundNumber: createRoundNumber(1),
    hand: new Hand(createColor(10, 10, 10)),
    offeredCards,
    remainingDeck,
  });
}

// 指定したラウンド変更効果を持つテスト用特殊カードを生成する。
function createModifierCard(
  id: string,
  effect: RevealColorValuesEffect | PreventBurstEffect,
): GameCard {
  return createEffectCard(id, effect);
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
      overflowPolicy: GameRules.clampChallenge().overflowPolicy,
      cardOfferSize: GameRules.clampChallenge().cardOfferSize,
    });

    expect(action.status).toBe(GameRoundActionStatus.Continued);
    expect(action.round.hand.color).toMatchObject({
      red: 15,
      green: 10,
      blue: 10,
    });
    expect(action.round.offeredCards.map((card) => card.id.value)).toEqual([
      'next',
    ]);
  });

  it('候補にないカードIDではラウンドを変更しない', () => {
    const round = createRound([createCard('offered', 1, 1, 1)], []);
    const action = round.playCard({
      cardId: createGameCardId('missing'),
      overflowPolicy: GameRules.classic().overflowPolicy,
      cardOfferSize: GameRules.classic().cardOfferSize,
    });

    expect(action.status).toBe(GameRoundActionStatus.CardNotOffered);
    expect(action.round).toBe(round);
  });

  it('最後の候補を適用すると山札切れを返す', () => {
    const round = createRound([createCard('last', 1, 1, 1)], []);
    const action = round.playCard({
      cardId: createGameCardId('last'),
      overflowPolicy: GameRules.classic().overflowPolicy,
      cardOfferSize: GameRules.classic().cardOfferSize,
    });

    expect(action.status).toBe(GameRoundActionStatus.DeckExhausted);
    expect(action.round.hand.color).toMatchObject({
      red: 11,
      green: 11,
      blue: 11,
    });
  });

  it('数値表示解禁をラウンド終了まで保持する', () => {
    const revealCard = createModifierCard(
      'reveal',
      new RevealColorValuesEffect(),
    );
    const action = createRound(
      [revealCard],
      [createCard('next', 1, 1, 1)],
    ).playCard({
      cardId: revealCard.id,
      overflowPolicy: GameRules.classic().overflowPolicy,
      cardOfferSize: GameRules.classic().cardOfferSize,
    });

    expect(action.round.revealsColorValues).toBe(true);
  });

  it('防止効果が次の終了バーストだけを255固定へ変え、その後も続行する', () => {
    const preventionCard = createModifierCard(
      'prevent',
      new PreventBurstEffect(),
    );
    const burstCard = createCard('burst', 10, 0, 0);
    const safeCard = createCard('safe', 0, 1, 0);
    const round = new GameRound({
      roundNumber: createRoundNumber(1),
      hand: new Hand(createColor(250, 10, 10)),
      offeredCards: [preventionCard],
      remainingDeck: [burstCard, safeCard],
    });
    const protectedRound = round.playCard({
      cardId: preventionCard.id,
      overflowPolicy: GameRules.classic().overflowPolicy,
      cardOfferSize: GameRules.classic().cardOfferSize,
    }).round;
    const action = protectedRound.playCard({
      cardId: burstCard.id,
      overflowPolicy: GameRules.classic().overflowPolicy,
      cardOfferSize: GameRules.classic().cardOfferSize,
    });

    expect(action.status).toBe(GameRoundActionStatus.Continued);
    expect(action.round.hand.color.red).toBe(255);
    expect(action.round.burstPreventionCount.value).toBe(0);
    expect(action.round.offeredCards[0]?.id).toBe(safeCard.id);
  });
});
