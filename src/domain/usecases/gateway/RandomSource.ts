import type { IntegerRange } from '../../models/shared/IntegerRange';

// Domainが必要とする範囲付き整数乱数の供給契約。
export interface RandomSource {
  // 指定された検証済み範囲から整数を1つ返す。
  nextInteger(range: IntegerRange): number;
}
