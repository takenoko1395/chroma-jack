import { describe, expect, it } from 'vitest';
import { Color } from '../models/color/Color';
import type { GameState } from '../models/game/Game';
import { GameScore } from '../models/game/GameScore';
import { ColorCard } from '../models/hand/ColorCard';
import { Hand } from '../models/hand/Hand';
import { GameRules } from '../models/rules/GameRules';
import { IntegerRange } from '../models/shared/IntegerRange';
import { FixedRandomGenerator } from '../../test/helpers/FixedRandomGenerator';
import { GameEngine } from './GameEngine';

function createEngine(values: readonly number[]): GameEngine {
  return new GameEngine(GameRules.classic(), new FixedRandomGenerator(values));
}

describe('game actions', () => {
  it('範囲内の初期色と黒でない12枚のカードでラウンド1を始める', () => {
    const game = createEngine([0, 63, 127, 0]).startGame();

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
    const engine = createEngine([10]);
    const started = engine.startGame();
    const accepted = engine.acceptCurrentCard(started);
    expect(accepted.currentHand?.color).toMatchObject({
      red: 20,
      green: 20,
      blue: 20,
    });

    const discarded = engine.discardCurrentCard(accepted);
    expect(discarded.currentHand).toBe(accepted.currentHand);
  });

  it('止めるとスコアを確定する', () => {
    const engine = createEngine([10]);
    const finished = engine.standCurrentRound(engine.startGame());
    expect(finished.phase).toBe('roundFinished');
    expect(finished.roundResults).toHaveLength(1);
    expect(finished.roundResults[0]?.endReason).toBe('stood');
    expect(finished.currentCard).not.toBeNull();
    expect(finished.remainingDeck).toHaveLength(11);
  });

  it('最後のカードを使うと山札切れで終了する', () => {
    const engine = createEngine([1]);
    let game = engine.startGame();
    for (let index = 0; index < 12; index += 1) {
      game = engine.discardCurrentCard(game);
    }
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
      rulesId: 'classic',
      rules: GameRules.classic(),
      totalRounds: 5,
      currentRoundNumber: 1,
      currentHand: new Hand(currentColor),
      currentCard,
      remainingDeck: [],
      roundResults: [],
    };
    const stateEngine = new GameEngine(
      state.rules,
      new FixedRandomGenerator([1]),
    );
    const finished = stateEngine.acceptCurrentCard(state);
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
    const engine = createEngine([10]);
    let game = engine.startGame();
    for (let round = 1; round <= 5; round += 1) {
      game = engine.standCurrentRound(game);
      game = engine.startNextRound(game);
    }
    expect(game.phase).toBe('gameFinished');
    expect(game.roundResults).toHaveLength(5);
    expect(GameScore.calculate(game.roundResults).value).toBe(
      game.roundResults.reduce((total, result) => total + result.score, 0),
    );
  });

  it('不正な状態の操作では状態を変更しない', () => {
    const engine = createEngine([10]);
    const finished = engine.standCurrentRound(engine.startGame());
    expect(engine.acceptCurrentCard(finished)).toBe(finished);
    expect(engine.discardCurrentCard(finished)).toBe(finished);
  });

  it('外から注入した初期色上限とルール識別子を使用する', () => {
    const base = GameRules.classic();
    const initialRange = IntegerRange.create(0, 10);
    expect(initialRange).toBeInstanceOf(IntegerRange);
    if (!(initialRange instanceof IntegerRange)) return;
    const rules = new GameRules(
      'small-initial-color',
      base.totalRounds,
      base.deckSize,
      initialRange,
      base.cardColorRange,
      base.initialColorGeneration,
      base.cardColorGeneration,
      base.overflow,
      base.scoring,
    );
    const game = new GameEngine(
      rules,
      new FixedRandomGenerator([127]),
    ).startGame();

    expect(game.rulesId).toBe('small-initial-color');
    expect(game.currentHand?.color).toMatchObject({
      red: 10,
      green: 10,
      blue: 10,
    });
  });

  it('異なるルールで作られた状態を途中から処理しない', () => {
    const classicEngine = createEngine([10]);
    const state = classicEngine.startGame();
    const challengeEngine = new GameEngine(
      GameRules.clampChallenge(),
      new FixedRandomGenerator([10]),
    );

    expect(() => challengeEngine.acceptCurrentCard(state)).toThrow(RangeError);
  });

  it('クランプルールでは超過後も次のカードへ進み、得点上限を下げる', () => {
    const rules = GameRules.clampChallenge();
    const engine = new GameEngine(rules, new FixedRandomGenerator([1]));
    const color = Color.create(250, 255, 255);
    const currentCard = ColorCard.create('current', 10, 0, 0);
    const nextCard = ColorCard.create('next', 1, 1, 1);
    expect(color).toBeInstanceOf(Color);
    expect(currentCard).toBeInstanceOf(ColorCard);
    expect(nextCard).toBeInstanceOf(ColorCard);
    if (
      !(color instanceof Color) ||
      !(currentCard instanceof ColorCard) ||
      !(nextCard instanceof ColorCard)
    ) {
      return;
    }
    const state: GameState = {
      phase: 'playing',
      rulesId: rules.id,
      rules,
      totalRounds: rules.totalRounds,
      currentRoundNumber: 1,
      currentHand: new Hand(color),
      currentCard,
      remainingDeck: [nextCard],
      roundResults: [],
    };

    const continued = engine.acceptCurrentCard(state);
    expect(continued.phase).toBe('playing');
    expect(continued.currentHand?.color.red).toBe(255);
    expect(continued.currentHand?.clampedChannels.size).toBe(1);
    expect(continued.currentCard?.id).toBe('next');

    const finished = engine.standCurrentRound(continued);
    expect(finished.roundResults[0]?.score).toBe(800);
  });
});
