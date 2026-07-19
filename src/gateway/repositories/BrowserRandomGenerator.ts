import type { RandomGenerator } from '../../domain/repositories/RandomGenerator';
import type { IntegerRange } from '../../domain/models/shared/IntegerRange';

export class BrowserRandomGenerator implements RandomGenerator {
  nextInteger(range: IntegerRange): number {
    return (
      Math.floor(Math.random() * (range.maximum - range.minimum + 1)) +
      range.minimum
    );
  }
}
