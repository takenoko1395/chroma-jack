import { Hand } from '../hand/Hand';
import { RoundScore } from '../game/RoundScore';

// スコア計算で目標とする無彩色を示す。
export enum ScoreTarget {
  // RGB全成分の上限である白。
  White = 'white',
  // RGB全成分の下限である黒。
  Black = 'black',
}

// ScorePolicyの生成時に指定する採点条件。
export type ScorePolicyArgs = Readonly<{
  maximumScore: number;
  clampPenalty: number;
  target: ScoreTarget;
}>;

// 目標色への距離とクランプ履歴からラウンドスコアを算出するPolicy。
export class ScorePolicy {
  readonly maximumScore: number;
  readonly clampPenalty: number;
  readonly target: ScoreTarget;

  // 最大点、クランプ減点、目標色を検証して保持する。
  constructor(args: ScorePolicyArgs) {
    if (!Number.isSafeInteger(args.maximumScore) || args.maximumScore <= 0) {
      throw new RangeError('Maximum score must be a positive integer.');
    }
    if (!Number.isSafeInteger(args.clampPenalty) || args.clampPenalty < 0) {
      throw new RangeError('Clamp penalty must be a non-negative integer.');
    }
    this.maximumScore = args.maximumScore;
    this.clampPenalty = args.clampPenalty;
    this.target = args.target;
  }

  // 手札の色を採点し、クランプ数に応じた上限内のスコアを返す。
  calculate(hand: Hand): RoundScore {
    const channelLimit = Hand.CHANNEL_LIMIT;
    const targetChannel = this.target === ScoreTarget.White ? channelLimit : 0;
    const maximumDistance = Math.sqrt(3 * channelLimit ** 2);
    const distance = Math.sqrt(
      (targetChannel - hand.color.red) ** 2 +
        (targetChannel - hand.color.green) ** 2 +
        (targetChannel - hand.color.blue) ** 2,
    );
    const scoreCeiling = Math.max(
      0,
      this.maximumScore - hand.clampedChannels.size * this.clampPenalty,
    );
    const normalizedScore = Math.round(
      (1 - distance / maximumDistance) * this.maximumScore,
    );
    const score = RoundScore.create(
      Math.max(0, Math.min(scoreCeiling, normalizedScore)),
    );
    if (!(score instanceof RoundScore)) {
      throw new RangeError(`Calculated score must be valid: ${score}`);
    }
    return score;
  }
}
