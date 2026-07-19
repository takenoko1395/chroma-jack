import type { ColorCard } from '../hand/ColorCard';
import type { Hand } from '../hand/Hand';
import type { RoundResult } from './Round';

export type GamePhase =
  'notStarted' | 'playing' | 'roundFinished' | 'gameFinished';

export type GameState = Readonly<{
  phase: GamePhase;
  totalRounds: number;
  currentRoundNumber: number;
  currentHand: Hand | null;
  currentCard: ColorCard | null;
  remainingDeck: readonly ColorCard[];
  roundResults: readonly RoundResult[];
}>;
