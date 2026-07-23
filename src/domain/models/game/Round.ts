import type { Hand } from '../hand/Hand';
import type { ColorChannel } from '../color/ColorChannel';
import type { RoundNumber } from './RoundNumber';
import type { RoundScore } from './RoundScore';

// バースト結果に最低1つの色成分が含まれることを保証する配列。
export type BurstChannels = readonly [ColorChannel, ...ColorChannel[]];

// バースト以外でラウンドが終了した理由を示す。
export type NormalRoundEndReason = 'stood' | 'deckExhausted';
// ラウンドが終了したすべての理由を示す。
export type RoundEndReason = NormalRoundEndReason | 'burst';

// すべてのラウンド結果に共通する確定情報。
type RoundResultBase = Readonly<{
  roundNumber: RoundNumber;
  finalHand: Hand;
  score: RoundScore;
}>;

// 通常終了または山札切れで確定したラウンド結果。
export type NormalRoundResult = RoundResultBase &
  Readonly<{
    endReason: NormalRoundEndReason;
    burstHand: null;
    burstChannels: null;
  }>;

// バースト直前と加算後の両方の手札を保持するラウンド結果。
export type BurstRoundResult = RoundResultBase &
  Readonly<{
    endReason: 'burst';
    burstHand: Hand;
    burstChannels: BurstChannels;
  }>;

// 終了理由によって必要な情報を型で保証するラウンド結果。
export type RoundResult = NormalRoundResult | BurstRoundResult;
