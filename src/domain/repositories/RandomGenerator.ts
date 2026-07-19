import type { IntegerRange } from '../models/shared/IntegerRange';

export interface RandomGenerator {
  nextInteger(range: IntegerRange): number;
}
