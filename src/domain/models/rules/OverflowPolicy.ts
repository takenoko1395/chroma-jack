import type { ColorChannel } from '../color/ColorChannel';

// 色成分が上限を超えたときの処理方法を示す。
export enum OverflowBehavior {
  // バーストとしてラウンドを終了する。
  EndRound = 'endRound',
  // 超過成分を上限へ固定してラウンドを続行する。
  ClampAndContinue = 'clampAndContinue',
}

// RGB成分ごとの超過処理を保持するPolicy。
export class OverflowPolicy {
  private readonly behaviors: Readonly<Record<ColorChannel, OverflowBehavior>>;

  // RGB成分ごとの処理を防御コピーして保持する。
  constructor(behaviors: Readonly<Record<ColorChannel, OverflowBehavior>>) {
    this.behaviors = Object.freeze({ ...behaviors });
  }

  // 指定した色成分へ適用する超過処理を返す。
  behaviorFor(channel: ColorChannel): OverflowBehavior {
    return this.behaviors[channel];
  }

  // どの成分が超過してもラウンドを終了するPolicyを生成する。
  static endRound(): OverflowPolicy {
    return new OverflowPolicy({
      red: OverflowBehavior.EndRound,
      green: OverflowBehavior.EndRound,
      blue: OverflowBehavior.EndRound,
    });
  }

  // どの成分が超過しても255へ固定して続行するPolicyを生成する。
  static clampAndContinue(): OverflowPolicy {
    return new OverflowPolicy({
      red: OverflowBehavior.ClampAndContinue,
      green: OverflowBehavior.ClampAndContinue,
      blue: OverflowBehavior.ClampAndContinue,
    });
  }
}
