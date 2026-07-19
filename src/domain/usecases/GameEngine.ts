import { Color } from '../models/color/Color';
import type { GameState } from '../models/game/Game';
import type { NormalRoundEndReason, RoundResult } from '../models/game/Round';
import { ColorCard, ColorCardCreationFailure } from '../models/hand/ColorCard';
import { Hand, HandAdditionStatus } from '../models/hand/Hand';
import type { ColorGenerationPolicy } from '../models/rules/ColorGenerationPolicy';
import type { GameRules } from '../models/rules/GameRules';
import type { IntegerRange } from '../models/shared/IntegerRange';
import type { RandomGenerator } from '../repositories/RandomGenerator';

// 注入されたルールと乱数生成器を固定し、ゲーム状態を遷移させる。
export class GameEngine {
  // 1ゲームで固定するルールと乱数生成器を受け取る。
  constructor(
    readonly rules: GameRules,
    private readonly random: RandomGenerator,
  ) {}

  // タイトル画面で使用する未開始状態を生成する。
  createInitialState(): GameState {
    return {
      phase: 'notStarted',
      rulesId: this.rules.id,
      rules: this.rules,
      totalRounds: this.rules.totalRounds,
      currentRoundNumber: 0,
      currentHand: null,
      currentCard: null,
      remainingDeck: [],
      roundResults: [],
    };
  }

  // 過去の結果を持たない第1ラウンドを開始する。
  startGame(): GameState {
    return this.createRound(this.createInitialState(), 1);
  }

  // 公開カードを手札へ加え、ルールに従って次状態へ進める。
  acceptCurrentCard(state: GameState): GameState {
    this.assertRules(state);
    if (
      state.phase !== 'playing' ||
      state.currentHand === null ||
      state.currentCard === null
    ) {
      return state;
    }

    const addition = state.currentHand.add(
      state.currentCard,
      this.rules.overflow,
    );
    if (addition.status === HandAdditionStatus.Burst) {
      return this.finishBurstRound(
        { ...state, currentCard: null },
        addition.hand,
      );
    }
    return this.revealNextCard({ ...state, currentHand: addition.hand });
  }

  // 公開カードを加えずに破棄し、次のカードへ進める。
  discardCurrentCard(state: GameState): GameState {
    this.assertRules(state);
    if (state.phase !== 'playing' || state.currentCard === null) return state;
    return this.revealNextCard(state);
  }

  // 現在の手札を確定してラウンドを終了する。
  standCurrentRound(state: GameState): GameState {
    this.assertRules(state);
    return this.finishRound(state, 'stood');
  }

  // 次ラウンドを開始し、最終ラウンド後はゲームを終了する。
  startNextRound(state: GameState): GameState {
    this.assertRules(state);
    if (state.phase !== 'roundFinished') return state;
    if (state.currentRoundNumber >= state.totalRounds) {
      return { ...state, phase: 'gameFinished' };
    }
    return this.createRound(state, state.currentRoundNumber + 1);
  }

  // 同じルールを保持した未開始状態へ戻す。
  returnToTitle(): GameState {
    return this.createInitialState();
  }

  // 別ルールで生成された状態が途中から混入することを防ぐ。
  private assertRules(state: GameState): void {
    if (state.rules !== this.rules) {
      throw new RangeError(
        `Game state uses rules "${state.rulesId}", not this engine's rules.`,
      );
    }
  }

  // 生成Policyと乱数を使い、指定範囲内の色を生成する。
  private generateColor(
    range: IntegerRange,
    generation: ColorGenerationPolicy,
  ): Color {
    const color = Color.create(
      generation.generateChannel(range, this.random),
      generation.generateChannel(range, this.random),
      generation.generateChannel(range, this.random),
    );
    if (!(color instanceof Color)) {
      throw new RangeError(
        `Random generator returned an invalid color: ${color}`,
      );
    }
    return color;
  }

  // カード生成Policyを使い、黒ではないカードを生成する。
  private generateCard(roundNumber: number, cardNumber: number): ColorCard {
    const { cardColorRange, cardColorGeneration } = this.rules;
    const id = `round-${roundNumber}-card-${cardNumber}`;
    const red = cardColorGeneration.generateChannel(
      cardColorRange,
      this.random,
    );
    const green = cardColorGeneration.generateChannel(
      cardColorRange,
      this.random,
    );
    const blue = cardColorGeneration.generateChannel(
      cardColorRange,
      this.random,
    );
    const generatedCard = ColorCard.create(id, red, green, blue);

    if (generatedCard instanceof ColorCard) return generatedCard;
    if (generatedCard === ColorCardCreationFailure.Black) {
      const nonBlackCard = ColorCard.create(id, red, green, 1);
      if (nonBlackCard instanceof ColorCard) return nonBlackCard;
    }
    throw new RangeError(
      `Random generator returned an invalid card: ${generatedCard}`,
    );
  }

  // 新しい初期手札と山札を生成して指定ラウンドを開始する。
  private createRound(state: GameState, roundNumber: number): GameState {
    const currentHand = new Hand(
      this.generateColor(
        this.rules.initialColorRange,
        this.rules.initialColorGeneration,
      ),
    );
    const deck = Array.from({ length: this.rules.deckSize }, (_, index) =>
      this.generateCard(roundNumber, index + 1),
    );
    return {
      ...state,
      phase: 'playing',
      currentRoundNumber: roundNumber,
      currentHand,
      currentCard: deck[0] ?? null,
      remainingDeck: deck.slice(1),
    };
  }

  // 通常終了したラウンドの色とスコアを確定する。
  private finishRound(
    state: GameState,
    reason: NormalRoundEndReason,
  ): GameState {
    if (state.phase !== 'playing' || state.currentHand === null) return state;
    const result: RoundResult = {
      rulesId: this.rules.id,
      roundNumber: state.currentRoundNumber,
      finalHand: state.currentHand,
      burstHand: null,
      score: this.rules.scoring.calculate(state.currentHand),
      endReason: reason,
    };
    return {
      ...state,
      phase: 'roundFinished',
      roundResults: [...state.roundResults, result],
    };
  }

  // バースト直前と加算後の手札を保存して0点で確定する。
  private finishBurstRound(state: GameState, burstHand: Hand): GameState {
    if (state.phase !== 'playing' || state.currentHand === null) return state;
    const result: RoundResult = {
      rulesId: this.rules.id,
      roundNumber: state.currentRoundNumber,
      finalHand: state.currentHand,
      burstHand,
      score: 0,
      endReason: 'burst',
    };
    return {
      ...state,
      phase: 'roundFinished',
      roundResults: [...state.roundResults, result],
    };
  }

  // 山札から次のカードを公開し、空ならラウンドを確定する。
  private revealNextCard(state: GameState): GameState {
    const [nextCard, ...remainingDeck] = state.remainingDeck;
    if (nextCard === undefined) {
      return this.finishRound({ ...state, currentCard: null }, 'deckExhausted');
    }
    return { ...state, currentCard: nextCard, remainingDeck };
  }
}
