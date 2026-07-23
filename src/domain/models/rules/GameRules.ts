import { CardColorAmount } from '../card/CardColorAmount';
import { Hand } from '../hand/Hand';
import { IntegerRange } from '../shared/IntegerRange';
import {
  ColorGenerationPolicy,
  ColorGenerationTrend,
} from './ColorGenerationPolicy';
import { OverflowPolicy } from './OverflowPolicy';
import { ScorePolicy, ScoreTarget } from './ScorePolicy';
import {
  CardTypeDistribution,
  createCardTypeWeights,
} from './CardTypeDistribution';
import { ColorDeckMode } from './ColorDeckMode';
import { GameRuleId } from './GameRuleId';
import { CardOfferSize } from './CardOfferSize';

// 固定値から検証済みのルール用整数範囲を生成する。
function createRange(minimum: number, maximum: number): IntegerRange {
  const range = IntegerRange.create(minimum, maximum);
  if (!(range instanceof IntegerRange)) {
    throw new RangeError(`Invalid rule range: ${range}`);
  }
  return range;
}

// 固定文字列から検証済みのゲームルールIDを生成する。
function createRuleId(value: string): GameRuleId {
  const id = GameRuleId.create(value);
  if (!(id instanceof GameRuleId)) {
    throw new RangeError(`Invalid built-in rule id: ${id}`);
  }
  return id;
}

// 固定値から検証済みのカード公開枚数を生成する。
function createCardOfferSize(value: number): CardOfferSize {
  const size = CardOfferSize.create(value);
  if (!(size instanceof CardOfferSize)) {
    throw new RangeError(`Invalid built-in card offer size: ${size}`);
  }
  return size;
}

// GameRulesの生成時に指定する設定値とPolicy一式。
export type GameRulesArgs = Readonly<{
  id: GameRuleId;
  totalRounds: number;
  deckSize: number;
  cardOfferSize: CardOfferSize;
  initialColorRange: IntegerRange;
  cardColorRange: IntegerRange;
  initialColorGenerationPolicy: ColorGenerationPolicy;
  cardColorGenerationPolicy: ColorGenerationPolicy;
  colorDeckMode: ColorDeckMode;
  cardTypeDistribution: CardTypeDistribution;
  overflowPolicy: OverflowPolicy;
  scorePolicy: ScorePolicy;
}>;

// 1ゲームで固定して使用する生成・超過・採点ルール一式。
export class GameRules {
  readonly id: GameRuleId;
  readonly totalRounds: number;
  readonly deckSize: number;
  readonly cardOfferSize: CardOfferSize;
  readonly initialColorRange: IntegerRange;
  readonly cardColorRange: IntegerRange;
  readonly initialColorGenerationPolicy: ColorGenerationPolicy;
  readonly cardColorGenerationPolicy: ColorGenerationPolicy;
  readonly colorDeckMode: ColorDeckMode;
  readonly cardTypeDistribution: CardTypeDistribution;
  readonly overflowPolicy: OverflowPolicy;
  readonly scorePolicy: ScorePolicy;

  // 1ゲームで使用するすべてのPolicyと設定値を検証して保持する。
  constructor(args: GameRulesArgs) {
    if (!Number.isSafeInteger(args.totalRounds) || args.totalRounds <= 0) {
      throw new RangeError('Total rounds must be a positive integer.');
    }
    if (!Number.isSafeInteger(args.deckSize) || args.deckSize <= 0) {
      throw new RangeError('Deck size must be a positive integer.');
    }
    if (args.cardOfferSize.value > args.deckSize) {
      throw new RangeError(
        'Card offer size must be a positive integer within the deck size.',
      );
    }
    if (
      args.initialColorRange.minimum < 0 ||
      args.initialColorRange.maximum > Hand.CHANNEL_LIMIT
    ) {
      throw new RangeError('Initial colors must fit within the hand limit.');
    }
    if (
      args.cardColorRange.minimum < 0 ||
      args.cardColorRange.maximum > CardColorAmount.MAXIMUM_CHANNEL ||
      args.cardColorRange.maximum === 0
    ) {
      throw new RangeError(
        'Card colors must fit within the card limits and allow a non-black card.',
      );
    }
    if (
      args.colorDeckMode !== ColorDeckMode.RandomMixed &&
      args.deckSize % 3 !== 0
    ) {
      throw new RangeError(
        'A balanced RGB or CMY deck size must be divisible by three.',
      );
    }

    this.id = args.id;
    this.totalRounds = args.totalRounds;
    this.deckSize = args.deckSize;
    this.cardOfferSize = args.cardOfferSize;
    this.initialColorRange = args.initialColorRange;
    this.cardColorRange = args.cardColorRange;
    this.initialColorGenerationPolicy = args.initialColorGenerationPolicy;
    this.cardColorGenerationPolicy = args.cardColorGenerationPolicy;
    this.colorDeckMode = args.colorDeckMode;
    this.cardTypeDistribution = args.cardTypeDistribution;
    this.overflowPolicy = args.overflowPolicy;
    this.scorePolicy = args.scorePolicy;
  }

  // 従来のバースト終了ルールを生成する。
  static classic(): GameRules {
    return new GameRules({
      id: createRuleId('classic'),
      totalRounds: 5,
      deckSize: 12,
      cardOfferSize: createCardOfferSize(1),
      initialColorRange: createRange(0, 20),
      cardColorRange: createRange(0, CardColorAmount.MAXIMUM_CHANNEL),
      initialColorGenerationPolicy: new ColorGenerationPolicy(
        ColorGenerationTrend.Lower,
      ),
      cardColorGenerationPolicy: new ColorGenerationPolicy(
        ColorGenerationTrend.Uniform,
      ),
      colorDeckMode: ColorDeckMode.BalancedChannels,
      cardTypeDistribution: CardTypeDistribution.addColorOnly(),
      overflowPolicy: OverflowPolicy.classic(),
      scorePolicy: new ScorePolicy({
        maximumScore: 1000,
        clampPenalty: 0,
        target: ScoreTarget.White,
      }),
    });
  }

  // 明るい初期色からCMYを減算し、黒を目指す基本ルールを生成する。
  static cmySubtractive(): GameRules {
    return new GameRules({
      id: createRuleId('cmy-subtractive'),
      totalRounds: 5,
      deckSize: 12,
      cardOfferSize: createCardOfferSize(1),
      initialColorRange: createRange(235, Hand.CHANNEL_LIMIT),
      cardColorRange: createRange(0, CardColorAmount.MAXIMUM_CHANNEL),
      initialColorGenerationPolicy: new ColorGenerationPolicy(
        ColorGenerationTrend.Higher,
      ),
      cardColorGenerationPolicy: new ColorGenerationPolicy(
        ColorGenerationTrend.Uniform,
      ),
      colorDeckMode: ColorDeckMode.BalancedChannels,
      cardTypeDistribution: CardTypeDistribution.subtractColorOnly(),
      overflowPolicy: OverflowPolicy.classic(),
      scorePolicy: new ScorePolicy({
        maximumScore: 1000,
        clampPenalty: 0,
        target: ScoreTarget.Black,
      }),
    });
  }

  // 超過成分を固定し、固定数に応じて得点上限を下げるルールを生成する。
  static clampChallenge(): GameRules {
    return new GameRules({
      id: createRuleId('clamp-challenge'),
      totalRounds: 5,
      deckSize: 24,
      cardOfferSize: createCardOfferSize(3),
      initialColorRange: createRange(0, 159),
      cardColorRange: createRange(0, CardColorAmount.MAXIMUM_CHANNEL),
      initialColorGenerationPolicy: new ColorGenerationPolicy(
        ColorGenerationTrend.Lower,
      ),
      cardColorGenerationPolicy: new ColorGenerationPolicy(
        ColorGenerationTrend.Higher,
      ),
      colorDeckMode: ColorDeckMode.BalancedChannels,
      cardTypeDistribution: CardTypeDistribution.addColorOnly(),
      overflowPolicy: OverflowPolicy.clampAndContinue(1),
      scorePolicy: new ScorePolicy({
        maximumScore: 1000,
        clampPenalty: 200,
        target: ScoreTarget.White,
      }),
    });
  }

  // すべての特殊カードを試せる3枚選択ルールを生成する。
  static specialDeck(): GameRules {
    return new GameRules({
      id: createRuleId('special-deck'),
      totalRounds: 5,
      deckSize: 30,
      cardOfferSize: createCardOfferSize(3),
      initialColorRange: createRange(0, 127),
      cardColorRange: createRange(0, CardColorAmount.MAXIMUM_CHANNEL),
      initialColorGenerationPolicy: new ColorGenerationPolicy(
        ColorGenerationTrend.Lower,
      ),
      cardColorGenerationPolicy: new ColorGenerationPolicy(
        ColorGenerationTrend.Uniform,
      ),
      colorDeckMode: ColorDeckMode.RandomMixed,
      cardTypeDistribution: new CardTypeDistribution(
        createCardTypeWeights({
          addColor: 60,
          adjustChannels: 10,
          swapChannels: 10,
          adjustSaturation: 8,
          adjustBrightness: 8,
          revealColorValues: 5,
          preventBurst: 1,
        }),
      ),
      overflowPolicy: OverflowPolicy.classic(),
      scorePolicy: new ScorePolicy({
        maximumScore: 1000,
        clampPenalty: 0,
        target: ScoreTarget.White,
      }),
    });
  }
}
