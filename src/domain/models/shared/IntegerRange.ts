// 検証済みの最小値と最大値を保持する整数範囲のValue Object。
export class IntegerRange {
  // 検証済みの境界値を保持する範囲を組み立てる。
  private constructor(
    readonly minimum: number,
    readonly maximum: number,
  ) {}

  // 内部設定として渡された境界値を検証し、不正ならプログラマーエラーとして扱う。
  static create(minimum: number, maximum: number): IntegerRange {
    if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum)) {
      throw new RangeError('Range boundaries must be safe integers.');
    }
    if (minimum > maximum) {
      throw new RangeError('Range minimum must not exceed maximum.');
    }
    return new IntegerRange(minimum, maximum);
  }

  // 指定値がこの範囲に含まれる安全な整数かを返す。
  contains(value: number): boolean {
    return (
      Number.isSafeInteger(value) &&
      value >= this.minimum &&
      value <= this.maximum
    );
  }
}
