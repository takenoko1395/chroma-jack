// ラウンド番号を生成できなかった理由を示す。
export enum RoundNumberCreationFailure {
  // ラウンド番号が正の安全な整数ではない。
  NotPositiveInteger = 'notPositiveInteger',
}

// 1以上のラウンド番号を保持するValue Object。
export class RoundNumber {
  // 検証済みのラウンド番号を保持する。
  private constructor(readonly value: number) {}

  // 生の数値を検証し、ラウンド番号または生成失敗理由を返す。
  static create(value: number): RoundNumber | RoundNumberCreationFailure {
    if (!Number.isSafeInteger(value) || value <= 0) {
      return RoundNumberCreationFailure.NotPositiveInteger;
    }
    return new RoundNumber(value);
  }

  // 1つ後のラウンド番号を返す。
  next(): RoundNumber {
    const next = RoundNumber.create(this.value + 1);
    if (!(next instanceof RoundNumber)) {
      throw new RangeError('The next round number must be a safe integer.');
    }
    return next;
  }
}
