import { describe, expect, it } from 'vitest';
import { Color } from '../models/color/Color';
import type { GameState } from '../models/game/Game';
import { GameScore } from '../models/game/GameScore';
import { ColorCard } from '../models/hand/ColorCard';
import { Hand } from '../models/hand/Hand';
import { FixedRandomGenerator } from '../../test/helpers/FixedRandomGenerator';
import {
  acceptCurrentCard,
  discardCurrentCard,
  standCurrentRound,
  startGame,
  startNextRound,
} from './gameActions';

describe('game actions', () => {
  it('範囲内の初期色と黒でない12枚のカードでラウンド1を始める', () => {
    const game = startGame(new FixedRandomGenerator([0, 63, 127, 0]));

    expect(game.phase).toBe('playing');
    expect(game.currentRoundNumber).toBe(1);
    expect(game.currentHand).not.toBeNull();
    expect(
      Object.values(game.currentHand?.color ?? {}).every(
        (channel) => channel >= 0 && channel <= 127,
      ),
    ).toBe(true);
    const deck = [game.currentCard, ...game.remainingDeck];
    expect(deck).toHaveLength(12);
    deck.forEach((card) => {
      expect(card).not.toBeNull();
      const channels = Object.values(card?.color ?? {});
      expect(channels.every((channel) => channel >= 0 && channel <= 63)).toBe(
        true,
      );
      expect(channels.some((channel) => channel > 0)).toBe(true);
    });
  });

  it('加えると現在色を更新し、捨てると現在色を維持する', () => {
    const started = startGame(new FixedRandomGenerator([10]));
    const accepted = acceptCurrentCard(started);
    expect(accepted.currentHand?.color).toMatchObject({
      red: 20,
      green: 20,
      blue: 20,
    });

    const discarded = discardCurrentCard(accepted);
    expect(discarded.currentHand).toBe(accepted.currentHand);
  });

  it('止めるとスコアを確定する', () => {
    const finished = standCurrentRound(
      startGame(new FixedRandomGenerator([10])),
    );
    expect(finished.phase).toBe('roundFinished');
    expect(finished.roundResults).toHaveLength(1);
    expect(finished.roundResults[0]?.endReason).toBe('stood');
    expect(finished.currentCard).not.toBeNull();
    expect(finished.remainingDeck).toHaveLength(11);
  });

  it('最後のカードを使うと山札切れで終了する', () => {
    let game = startGame(new FixedRandomGenerator([1]));
    for (let index = 0; index < 12; index += 1) game = discardCurrentCard(game);
    expect(game.phase).toBe('roundFinished');
    expect(game.roundResults[0]?.endReason).toBe('deckExhausted');
    expect(game.currentCard).toBeNull();
  });

  it('加算でバーストすると直前の色を保って0点にする', () => {
    const currentColor = Color.create(250, 10, 10);
    const currentCard = ColorCard.create('burst', 6, 1, 1);
    expect(currentColor).toBeInstanceOf(Color);
    expect(currentCard).toBeInstanceOf(ColorCard);
    if (
      !(currentColor instanceof Color) ||
      !(currentCard instanceof ColorCard)
    ) {
      return;
    }
    const state: GameState = {
      phase: 'playing',
      totalRounds: 5,
      currentRoundNumber: 1,
      currentHand: new Hand(currentColor),
      currentCard,
      remainingDeck: [],
      roundResults: [],
    };
    const finished = acceptCurrentCard(state);
    expect(finished.phase).toBe('roundFinished');
    expect(finished.currentHand).toBe(state.currentHand);
    expect(finished.roundResults[0]).toMatchObject({
      score: 0,
      endReason: 'burst',
    });
    expect(finished.roundResults[0]?.burstHand?.color).toMatchObject({
      red: 256,
      green: 11,
      blue: 11,
    });
  });

  it('5ラウンド後に終了し、合計スコアを算出する', () => {
    const random = new FixedRandomGenerator([10]);
    let game = startGame(random);
    for (let round = 1; round <= 5; round += 1) {
      game = standCurrentRound(game);
      game = startNextRound(game, random);
    }
    expect(game.phase).toBe('gameFinished');
    expect(game.roundResults).toHaveLength(5);
    expect(GameScore.calculate(game.roundResults).value).toBe(
      game.roundResults.reduce((total, result) => total + result.score, 0),
    );
  });

  it('不正な状態の操作では状態を変更しない', () => {
    const finished = standCurrentRound(
      startGame(new FixedRandomGenerator([10])),
    );
    expect(acceptCurrentCard(finished)).toBe(finished);
    expect(discardCurrentCard(finished)).toBe(finished);
  });
});
