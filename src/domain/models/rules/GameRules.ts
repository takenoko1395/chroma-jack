import { ColorCard } from '../hand/ColorCard';
import { Hand } from '../hand/Hand';
import { IntegerRange } from '../shared/IntegerRange';
import {
  ColorGenerationPolicy,
  ColorGenerationTrend,
} from './ColorGenerationPolicy';
import { OverflowPolicy } from './OverflowPolicy';
import { ScorePolicy } from './ScorePolicy';

// 固定値から検証済みのルール用整数範囲を生成する。
function createRange(minimum: number, maximum: number): IntegerRange {
  const range = IntegerRange.create(minimum, maximum);
  if (!(range instanceof IntegerRange)) {
    throw new RangeError(`Invalid rule range: ${range}`);
  }
  return range;
}

// 1ゲームで固定して使用する生成・超過・採点ルール一式。
export class GameRules {
  // 1ゲームで使用するすべてのPolicyと設定値を検証して保持する。
  constructor(
    readonly id: string,
    readonly totalRounds: number,
    readonly deckSize: number,
    readonly initialColorRange: IntegerRange,
    readonly cardColorRange: IntegerRange,
    readonly initialColorGeneration: ColorGenerationPolicy,
    readonly cardColorGeneration: ColorGenerationPolicy,
    readonly overflow: OverflowPolicy,
    readonly scoring: ScorePolicy,
  ) {
    if (id.trim().length === 0) throw new RangeError('Rules id is required.');
    if (!Number.isSafeInteger(totalRounds) || totalRounds <= 0) {
      throw new RangeError('Total rounds must be a positive integer.');
    }
    if (!Number.isSafeInteger(deckSize) || deckSize <= 0) {
      throw new RangeError('Deck size must be a positive integer.');
    }
    if (
      initialColorRange.minimum < 0 ||
      initialColorRange.maximum > Hand.CHANNEL_LIMIT
    ) {
      throw new RangeError('Initial colors must fit within the hand limit.');
    }
    if (
      cardColorRange.minimum < ColorCard.MINIMUM_CHANNEL ||
      cardColorRange.maximum > ColorCard.MAXIMUM_CHANNEL ||
      cardColorRange.maximum === 0
    ) {
      throw new RangeError(
        'Card colors must fit within the card limits and allow a non-black card.',
      );
    }
  }

  // 従来のバースト終了ルールを生成する。
  static classic(): GameRules {
    return new GameRules(
      'classic',
      5,
      12,
      createRange(0, 127),
      createRange(ColorCard.MINIMUM_CHANNEL, ColorCard.MAXIMUM_CHANNEL),
      new ColorGenerationPolicy(ColorGenerationTrend.Uniform),
      new ColorGenerationPolicy(ColorGenerationTrend.Uniform),
      OverflowPolicy.endRound(),
      new ScorePolicy(1000, 0),
    );
  }

  // 超過成分を固定し、固定数に応じて得点上限を下げるルールを生成する。
  static clampChallenge(): GameRules {
    return new GameRules(
      'clamp-challenge',
      5,
      12,
      createRange(0, 159),
      createRange(ColorCard.MINIMUM_CHANNEL, ColorCard.MAXIMUM_CHANNEL),
      new ColorGenerationPolicy(ColorGenerationTrend.Uniform),
      new ColorGenerationPolicy(ColorGenerationTrend.Higher),
      OverflowPolicy.clampAndContinue(),
      new ScorePolicy(1000, 200),
    );
  }
}
