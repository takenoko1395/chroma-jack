import type { IntegerRange } from '../../domain/models/shared/IntegerRange';
import type { RandomSource } from '../../domain/usecases/gateway/RandomSource';

// テストで指定した値を順番に返す決定的な乱数供給源。
export class FixedRandomSource implements RandomSource {
  private index = 0;

  // 繰り返し使用する値の並びを保持する。
  constructor(private readonly values: readonly number[]) {}

  // 次の指定値を範囲内へ収め、末尾まで進んだら先頭へ戻る。
  nextInteger(range: IntegerRange): number {
    const value = this.values[this.index % this.values.length];
    this.index += 1;
    if (value === undefined) return range.minimum;
    return Math.max(range.minimum, Math.min(range.maximum, value));
  }
}
