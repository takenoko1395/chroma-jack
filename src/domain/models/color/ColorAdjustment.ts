// RGB差分を生成できなかった理由を示す。
export enum ColorAdjustmentCreationFailure {
  // いずれかの差分が安全な整数ではない。
  NotInteger = 'notInteger',
  // 全成分の差分が0である。
  Empty = 'empty',
}

// RGB成分ごとの符号付き整数差分を保持するValue Object。
export class ColorAdjustment {
  // 検証済みのRGB差分を保持する。
  private constructor(
    readonly red: number,
    readonly green: number,
    readonly blue: number,
  ) {}

  // 生のRGB差分を検証し、差分または生成失敗理由を返す。
  static create(args: {
    red: number;
    green: number;
    blue: number;
  }): ColorAdjustment | ColorAdjustmentCreationFailure {
    const changes = [args.red, args.green, args.blue];
    if (changes.some((change) => !Number.isSafeInteger(change))) {
      return ColorAdjustmentCreationFailure.NotInteger;
    }
    if (changes.every((change) => change === 0)) {
      return ColorAdjustmentCreationFailure.Empty;
    }
    return new ColorAdjustment(args.red, args.green, args.blue);
  }
}
