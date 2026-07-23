// 未使用のバースト防止回数を保持するValue Object。
export class BurstPreventionCount {
  // 0以上の安全な整数を保持する。
  private constructor(readonly value: number) {}

  // 防止回数がない初期値を返す。
  static zero(): BurstPreventionCount {
    return new BurstPreventionCount(0);
  }

  // 防止効果を1回分追加した値を返す。
  grant(): BurstPreventionCount {
    const nextValue = this.value + 1;
    if (!Number.isSafeInteger(nextValue)) {
      throw new RangeError(
        'Burst prevention count must remain a safe integer.',
      );
    }
    return new BurstPreventionCount(nextValue);
  }

  // 防止効果を1回分消費した値を返す。
  consume(): BurstPreventionCount {
    if (this.value === 0) {
      throw new RangeError('Burst prevention cannot be consumed at zero.');
    }
    return new BurstPreventionCount(this.value - 1);
  }

  // 防止効果を1回以上使用できるかを返す。
  hasAny(): boolean {
    return this.value > 0;
  }
}
