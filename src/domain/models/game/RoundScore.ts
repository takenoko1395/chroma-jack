// ラウンド得点を生成できなかった理由を示す。
export enum RoundScoreCreationFailure {
  // 得点が0以上の安全な整数ではない。
  NotNonNegativeInteger = 'notNonNegativeInteger',
}

// 確定した0以上のラウンド得点を保持するValue Object。
export class RoundScore {
  // 検証済みの得点を保持する。
  private constructor(readonly value: number) {}

  // 生の数値を検証し、ラウンド得点または生成失敗理由を返す。
  static create(value: number): RoundScore | RoundScoreCreationFailure {
    if (!Number.isSafeInteger(value) || value < 0) {
      return RoundScoreCreationFailure.NotNonNegativeInteger;
    }
    return new RoundScore(value);
  }

  // バースト時に使用する0点を返す。
  static zero(): RoundScore {
    return new RoundScore(0);
  }
}
