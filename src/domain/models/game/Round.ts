import type { Hand } from '../hand/Hand';

export type NormalRoundEndReason = 'stood' | 'deckExhausted';
export type RoundEndReason = NormalRoundEndReason | 'burst';

type RoundResultBase = Readonly<{
  roundNumber: number;
  finalHand: Hand;
  score: number;
}>;

export type NormalRoundResult = RoundResultBase &
  Readonly<{
    endReason: NormalRoundEndReason;
    burstHand: null;
  }>;

export type BurstRoundResult = RoundResultBase &
  Readonly<{
    endReason: 'burst';
    burstHand: Hand;
    score: 0;
  }>;

export type RoundResult = NormalRoundResult | BurstRoundResult;
