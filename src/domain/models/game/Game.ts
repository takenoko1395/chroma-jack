import type { ColorCard } from '../hand/ColorCard';
import type { Hand } from '../hand/Hand';
import type { RoundResult } from './Round';

// ゲーム全体が現在どの進行段階にあるかを示す。
export type GamePhase =
  | 'notStarted'
  | 'playing'
  | 'roundFinished'
  | 'gameFinished';

// 画面描画と状態遷移に使用する、ある時点のゲーム状態。
export type GameState = Readonly<{
  // ゲームの進行段階を示す。
  phase: GamePhase;
  // 現在のラウンド番号。1から始まる。
  currentRoundNumber: number;
  // 現在のラウンドで使用中の手札。ラウンド開始前はnull。
  currentHand: Hand | null;
  // 現在のラウンドで提示中のカード。ラウンド開始前は空配列。
  offeredCards: readonly ColorCard[];
  // 現在のラウンドで残っている山札。ラウンド開始前は空配列。
  remainingDeck: readonly ColorCard[];
  // 現在までに終了したラウンドの結果。ラウンド開始前は空配列。
  roundResults: readonly RoundResult[];
}>;
