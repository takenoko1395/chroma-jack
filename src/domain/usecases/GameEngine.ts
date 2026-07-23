import { GameDeckFactory } from './factories/GameDeckFactory';
import { GameRoundFactory } from './factories/GameRoundFactory';
import type { GameState } from '../models/game/Game';
import type { GameCardId } from '../models/card/GameCardId';
import { GameRound, GameRoundActionStatus } from '../models/game/GameRound';
import type {
  BurstChannels,
  NormalRoundEndReason,
  RoundResult,
} from '../models/game/Round';
import { Hand } from '../models/hand/Hand';
import type { GameRules } from '../models/rules/GameRules';
import type { RandomSource } from './gateway/RandomSource';
import { RoundNumber } from '../models/game/RoundNumber';
import { RoundScore } from '../models/game/RoundScore';

// 固定値から検証済みのラウンド番号を生成する。
function createRoundNumber(value: number): RoundNumber {
  const roundNumber = RoundNumber.create(value);
  if (!(roundNumber instanceof RoundNumber)) {
    throw new RangeError(`Invalid round number: ${roundNumber}`);
  }
  return roundNumber;
}

// 注入されたルールとFactoryを固定し、ゲーム全体の状態を遷移させる。
export class GameEngine {
  private readonly roundFactory: GameRoundFactory;

  // 1ゲームで固定するルールを保持し、同じ乱数列を使うFactory一式を組み立てる。
  constructor(
    readonly rules: GameRules,
    randomSource: RandomSource,
  ) {
    const deckFactory = new GameDeckFactory(randomSource);
    this.roundFactory = new GameRoundFactory(randomSource, deckFactory);
  }

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
    return this.createRound(this.createInitialState(), createRoundNumber(1));
  }

  // 選択された候補カードの適用をGameRoundへ依頼し、ゲーム状態へ反映する。
  acceptOfferedCard(state: GameState, cardId: GameCardId): GameState {
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
    if (state.currentRound.roundNumber.value >= this.rules.totalRounds) {
      return { ...state, phase: 'gameFinished' };
    }
    return this.createRound(state, state.currentRound.roundNumber.next());
  }

  // 同じルールを保持した未開始状態へ戻す。
  returnToTitle(): GameState {
    return this.createInitialState();
  }

  // Factoryへ開始状態の生成を依頼して指定ラウンドへ遷移する。
  private createRound(state: GameState, roundNumber: RoundNumber): GameState {
    return {
      ...state,
      phase: 'playing',
      currentRound: this.roundFactory.create({
        rules: this.rules,
        roundNumber,
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
      score: RoundScore.zero(),
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
