import type { ColorCard } from '../hand/ColorCard';
import type { Hand } from '../hand/Hand';
import type { GameRules } from '../rules/GameRules';
import type { RoundResult } from './Round';

// ゲーム全体が現在どの進行段階にあるかを示す。
export type GamePhase =
  'notStarted' | 'playing' | 'roundFinished' | 'gameFinished';

// 画面描画と状態遷移に使用する、ある時点のゲーム状態。
export type GameState = Readonly<{
  phase: GamePhase;
  rulesId: string;
  rules: GameRules;
  totalRounds: number;
  currentRoundNumber: number;
  currentHand: Hand | null;
  currentCard: ColorCard | null;
  remainingDeck: readonly ColorCard[];
  roundResults: readonly RoundResult[];
}>;
