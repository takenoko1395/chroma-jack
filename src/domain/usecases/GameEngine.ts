import { GameCard, GameCardCreationFailure } from '../models/card/GameCard';
import { Color } from '../models/color/Color';
import type { GameState } from '../models/game/Game';
import { GameRound, GameRoundActionStatus } from '../models/game/GameRound';
import type {
  BurstChannels,
  NormalRoundEndReason,
  RoundResult,
} from '../models/game/Round';
import { Hand } from '../models/hand/Hand';
import type { ColorGenerationPolicy } from '../models/rules/ColorGenerationPolicy';
import type { GameRules } from '../models/rules/GameRules';
import type { IntegerRange } from '../models/shared/IntegerRange';
import type { RandomGenerator } from '../repositories/RandomGenerator';

// 注入されたルールと乱数生成器を固定し、ゲーム全体の状態を遷移させる。
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
      currentRound: null,
      roundResults: [],
    };
  }

  // 過去の結果を持たない第1ラウンドを開始する。
  startGame(): GameState {
    return this.createRound(this.createInitialState(), 1);
  }

  // 選択された候補カードの適用をGameRoundへ依頼し、ゲーム状態へ反映する。
  acceptOfferedCard(state: GameState, cardId: string): GameState {
    if (state.phase !== 'playing' || state.currentRound === null) return state;
    const action = state.currentRound.playCard({
      cardId,
      overflowPolicy: this.rules.overflowPolicy,
      cardOfferSize: this.rules.cardOfferSize,
    });

    if (action.status === GameRoundActionStatus.CardNotOffered) return state;
    if (action.status === GameRoundActionStatus.Burst) {
      if (action.burstHand === null) {
        throw new RangeError('A burst action must contain the attempted hand.');
      }
      return this.finishBurstRound(state, action.round, action.burstHand);
    }
    if (action.status === GameRoundActionStatus.DeckExhausted) {
      return this.finishRound(state, action.round, 'deckExhausted');
    }
    return { ...state, currentRound: action.round };
  }

  // 公開候補の一括破棄をGameRoundへ依頼し、次候補または終了へ進める。
  discardOffer(state: GameState): GameState {
    if (
      state.phase !== 'playing' ||
      state.currentRound === null ||
      state.currentRound.offeredCards.length === 0
    ) {
      return state;
    }
    const action = state.currentRound.discardOffer(this.rules.cardOfferSize);
    if (action.status === GameRoundActionStatus.DeckExhausted) {
      return this.finishRound(state, action.round, 'deckExhausted');
    }
    return { ...state, currentRound: action.round };
  }

  // 現在のHandを確定してラウンドを終了する。
  standCurrentRound(state: GameState): GameState {
    if (state.phase !== 'playing' || state.currentRound === null) return state;
    return this.finishRound(state, state.currentRound, 'stood');
  }

  // 次ラウンドを開始し、最終ラウンド後はゲームを終了する。
  startNextRound(state: GameState): GameState {
    if (state.phase !== 'roundFinished' || state.currentRound === null) {
      return state;
    }
    if (state.currentRound.roundNumber >= this.rules.totalRounds) {
      return { ...state, phase: 'gameFinished' };
    }
    return this.createRound(state, state.currentRound.roundNumber + 1);
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

  // カード生成Policyを使い、黒ではないRGB加算カードを生成する。
  private generateCard(roundNumber: number, cardNumber: number): GameCard {
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
    const generatedCard = GameCard.createAddColor(id, red, green, blue);

    if (generatedCard instanceof GameCard) return generatedCard;
    if (generatedCard === GameCardCreationFailure.Black) {
      const nonBlackCard = GameCard.createAddColor(id, red, green, 1);
      if (nonBlackCard instanceof GameCard) return nonBlackCard;
    }
    throw new RangeError(
      `Random generator returned an invalid card: ${generatedCard}`,
    );
  }

  // 新しい初期Handと山札を生成して指定ラウンドを開始する。
  private createRound(state: GameState, roundNumber: number): GameState {
    const hand = new Hand(
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
      currentRound: new GameRound({
        roundNumber,
        hand,
        offeredCards: deck.slice(0, this.rules.cardOfferSize),
        remainingDeck: deck.slice(this.rules.cardOfferSize),
      }),
    };
  }

  // 通常終了したラウンドのHandとスコアを確定する。
  private finishRound(
    state: GameState,
    round: GameRound,
    reason: NormalRoundEndReason,
  ): GameState {
    const result: RoundResult = {
      roundNumber: round.roundNumber,
      finalHand: round.hand,
      burstHand: null,
      burstChannels: null,
      score: this.rules.scorePolicy.calculate(round.hand),
      endReason: reason,
    };
    return {
      ...state,
      phase: 'roundFinished',
      currentRound: round,
      roundResults: [...state.roundResults, result],
    };
  }

  // バースト直前と効果適用後のHandを保存して0点で確定する。
  private finishBurstRound(
    state: GameState,
    round: GameRound,
    burstHand: Hand,
  ): GameState {
    const [firstBurstChannel, ...otherBurstChannels] =
      burstHand.clampedChannels;
    if (firstBurstChannel === undefined) {
      throw new RangeError('A burst must contain at least one color channel.');
    }
    const burstChannels: BurstChannels = [
      firstBurstChannel,
      ...otherBurstChannels,
    ];
    const result: RoundResult = {
      roundNumber: round.roundNumber,
      finalHand: round.hand,
      burstHand,
      burstChannels,
      score: 0,
      endReason: 'burst',
    };
    return {
      ...state,
      phase: 'roundFinished',
      currentRound: round,
      roundResults: [...state.roundResults, result],
    };
  }
}
