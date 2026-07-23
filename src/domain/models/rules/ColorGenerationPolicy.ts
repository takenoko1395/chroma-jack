import type { RandomSource } from '../../usecases/gateway/RandomSource';
import type { IntegerRange } from '../shared/IntegerRange';
import { Color } from '../color/Color';

// 範囲内の乱数をどちら側へ偏らせるかを示す。
export enum ColorGenerationTrend {
  // 一様な乱数をそのまま使用する。
  Uniform = 'uniform',
  // 2回の抽選から小さい値を採用する。
  Lower = 'lower',
  // 2回の抽選から大きい値を採用する。
  Higher = 'higher',
}

// 乱数を色成分へ変換するときの生成傾向を表すPolicy。
export class ColorGenerationPolicy {
  // 色成分の生成時に使用する偏りを固定する。
  constructor(readonly trend: ColorGenerationTrend) {}

  // 設定された傾向に従う検証済みRGB色を生成する。
  generateColor(range: IntegerRange, random: RandomSource): Color {
    const color = Color.create(
      this.generateChannel(range, random),
      this.generateChannel(range, random),
      this.generateChannel(range, random),
    );
    if (!(color instanceof Color)) {
      throw new RangeError(`Random source violated the color range: ${color}`);
    }
    return color;
  }

  // 設定された傾向に従って1つの色成分を生成する。
  private generateChannel(range: IntegerRange, random: RandomSource): number {
    const first = random.nextInteger(range);
    if (this.trend === ColorGenerationTrend.Uniform) return first;

    const second = random.nextInteger(range);
    return this.trend === ColorGenerationTrend.Higher
      ? Math.max(first, second)
      : Math.min(first, second);
  }
}
