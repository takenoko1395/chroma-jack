import { ColorCard } from '../hand/ColorCard';
import { Hand } from '../hand/Hand';
import {
  IntegerRange,
  type IntegerRangeCreationFailure,
} from '../shared/IntegerRange';

function defineRange(minimum: number, maximum: number): IntegerRange {
  const range: IntegerRange | IntegerRangeCreationFailure = IntegerRange.create(
    minimum,
    maximum,
  );
  if (!(range instanceof IntegerRange)) {
    throw new RangeError(`Invalid game configuration range: ${range}`);
  }
  return range;
}

export const GAME_CONFIG = {
  totalRounds: 5,
  deckSize: 12,
  initialColorRange: defineRange(0, 127),
  cardColorRange: defineRange(
    ColorCard.MINIMUM_CHANNEL,
    ColorCard.MAXIMUM_CHANNEL,
  ),
  maxRoundScore: Hand.MAXIMUM_SCORE,
} as const;
