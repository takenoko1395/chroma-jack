import type { IntegerRange } from '../../domain/models/shared/IntegerRange';
import type { RandomSource } from '../../domain/usecases/gateway/RandomSource';

// Math.randomをDomainの乱数供給契約へ適合させるGateway。
export class BrowserRandomSource implements RandomSource {
  // 検証済み範囲の両端を含む整数乱数を返す。
  nextInteger(range: IntegerRange): number {
    return (
      Math.floor(Math.random() * (range.maximum - range.minimum + 1)) +
      range.minimum
    );
  }
}
