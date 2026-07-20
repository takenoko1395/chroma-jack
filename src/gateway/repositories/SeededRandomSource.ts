import type { IntegerRange } from '../../domain/models/shared/IntegerRange';
import type { RandomSource } from '../../domain/repositories/RandomSource';

// 検証済みシードから再現可能な乱数列を供給するGateway。
export class SeededRandomSource implements RandomSource {
  static readonly MINIMUM_SEED = 0;
  static readonly MAXIMUM_SEED = 0xffffffff;

  private state: number;

  // 符号なし32bit整数のシードを初期状態として保持する。
  constructor(seed: number) {
    if (
      !Number.isSafeInteger(seed) ||
      seed < SeededRandomSource.MINIMUM_SEED ||
      seed > SeededRandomSource.MAXIMUM_SEED
    ) {
      throw new RangeError('Seed must be an unsigned 32-bit integer.');
    }
    this.state = seed;
  }

  // シードから決まる乱数列を指定範囲の整数へ変換する。
  nextInteger(range: IntegerRange): number {
    const unitValue = this.nextUnitValue();
    return (
      Math.floor(unitValue * (range.maximum - range.minimum + 1)) +
      range.minimum
    );
  }

  // 内部状態を進め、0以上1未満の再現可能な値を返す。
  private nextUnitValue(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 0x100000000;
  }
}
