import { Color } from '../models/color/Color';
import type { GameState } from '../models/game/Game';
import type {
  BurstChannels,
  NormalRoundEndReason,
  RoundResult,
} from '../models/game/Round';
import { ColorCard, ColorCardCreationFailure } from '../models/hand/ColorCard';
import { Hand, HandAdditionStatus } from '../models/hand/Hand';
import type { ColorGenerationPolicy } from '../models/rules/ColorGenerationPolicy';
import type { GameRules } from '../models/rules/GameRules';
import type { IntegerRange } from '../models/shared/IntegerRange';
import type { RandomGenerator } from '../repositories/RandomGenerator';

// 注入されたルールと乱数生成器を固定し、ゲーム状態を遷移させる。
// NOTE: Usecase(振る舞い)のため、状態遷移のみに責務を限定し、UIや永続化の責務は持たない。
// 状態の保持はReactのHooksに委ねる設計。
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
      currentRoundNumber: 0,
      currentHand: null,
      offeredCards: [],
      remainingDeck: [],
      roundResults: [],
    };
  }

  // 過去の結果を持たない第1ラウンドを開始する。
  startGame(): GameState {
    return this.createRound(this.createInitialState(), 1);
  }

  // 公開候補からIDで選んだ1枚だけを手札へ加え、次の候補へ進める。
  acceptOfferedCard(state: GameState, cardId: string): GameState {
    if (state.phase !== 'playing' || state.currentHand === null) {
      return state;
    }
    const selectedCard = state.offeredCards.find((card) => card.id === cardId);
    if (selectedCard === undefined) return state;

    const addition = state.currentHand.add(
      selectedCard,
      this.rules.overflowPolicy,
    );
    if (addition.status === HandAdditionStatus.Burst) {
      const [firstBurstChannel, ...otherBurstChannels] =
        addition.hand.clampedChannels;
      if (firstBurstChannel === undefined) {
        throw new RangeError(
          'A burst must contain at least one color channel.',
        );
      }
      return this.finishBurstRound(
        { ...state, offeredCards: [] },
        addition.hand,
        [firstBurstChannel, ...otherBurstChannels],
      );
    }
    return this.revealNextOffer({
      ...state,
      currentHand: addition.hand,
      offeredCards: [],
    });
  }

  // 公開中の候補をすべて破棄し、次の候補を公開する。
  discardOffer(state: GameState): GameState {
    if (state.phase !== 'playing' || state.offeredCards.length === 0) {
      return state;
    }
    return this.revealNextOffer({ ...state, offeredCards: [] });
  }

  // 現在の手札を確定してラウンドを終了する。
  standCurrentRound(state: GameState): GameState {
    return this.finishRound(state, 'stood');
  }

  // 次ラウンドを開始し、最終ラウンド後はゲームを終了する。
  startNextRound(state: GameState): GameState {
    if (state.phase !== 'roundFinished') return state;
    if (state.currentRoundNumber >= this.rules.totalRounds) {
      return { ...state, phase: 'gameFinished' };
    }
    return this.createRound(state, state.currentRoundNumber + 1);
  }

  // 同じルールを保持した未開始状態へ戻す。
  returnToTitle(): GameState {
    return this.createInitialState();
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
    const { cardColorRange, cardColorGenerationPolicy } = this.rules;
    const id = `round-${roundNumber}-card-${cardNumber}`;
    const red = cardColorGenerationPolicy.generateChannel(
      cardColorRange,
      this.random,
    );
    const green = cardColorGenerationPolicy.generateChannel(
      cardColorRange,
      this.random,
    );
    const blue = cardColorGenerationPolicy.generateChannel(
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
        this.rules.initialColorGenerationPolicy,
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
      offeredCards: deck.slice(0, this.rules.cardOfferSize),
      remainingDeck: deck.slice(this.rules.cardOfferSize),
    };
  }

  // 通常終了したラウンドの色とスコアを確定する。
  private finishRound(
    state: GameState,
    reason: NormalRoundEndReason,
  ): GameState {
    if (state.phase !== 'playing' || state.currentHand === null) return state;
    const result: RoundResult = {
      roundNumber: state.currentRoundNumber,
      finalHand: state.currentHand,
      burstHand: null,
      burstChannels: null,
      score: this.rules.scorePolicy.calculate(state.currentHand),
      endReason: reason,
    };
    return {
      ...state,
      phase: 'roundFinished',
      roundResults: [...state.roundResults, result],
    };
  }

  // バースト直前と加算後の手札を保存して0点で確定する。
  private finishBurstRound(
    state: GameState,
    burstHand: Hand,
    burstChannels: BurstChannels,
  ): GameState {
    if (state.phase !== 'playing' || state.currentHand === null) return state;
    const result: RoundResult = {
      roundNumber: state.currentRoundNumber,
      finalHand: state.currentHand,
      burstHand,
      burstChannels,
      score: 0,
      endReason: 'burst',
    };
    return {
      ...state,
      phase: 'roundFinished',
      roundResults: [...state.roundResults, result],
    };
  }

  // 山札からルール指定枚数を公開し、空ならラウンドを確定する。
  private revealNextOffer(state: GameState): GameState {
    if (state.remainingDeck.length === 0) {
      return this.finishRound({ ...state, offeredCards: [] }, 'deckExhausted');
    }
    return {
      ...state,
      offeredCards: state.remainingDeck.slice(0, this.rules.cardOfferSize),
      remainingDeck: state.remainingDeck.slice(this.rules.cardOfferSize),
    };
  }
}
