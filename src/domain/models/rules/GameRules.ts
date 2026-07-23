import { Color } from '../color/Color';
import { Hand } from '../hand/Hand';
import { IntegerRange } from '../shared/IntegerRange';
import { OverflowPolicy } from './OverflowPolicy';
import { ScorePolicy, ScoreTarget } from './ScorePolicy';
import {
  CardTypeDistribution,
  createCardTypeWeights,
} from './CardTypeDistribution';
import { GameRuleId } from './GameRuleId';
import { CardOfferSize } from './CardOfferSize';
import { DominantChannelDeckPolicy } from './DominantChannelDeckPolicy';

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
  // ルールの識別子を固定する。
  id: GameRuleId;
  // 1ゲームで行うラウンド数を固定する。
  totalRounds: number;
  // 1ゲームで使用する山札の枚数を固定する。
  deckSize: number;
  // 1ラウンドで公開するカード枚数を固定する。
  cardOfferSize: CardOfferSize;
  // 各ラウンドで使用する初期色を固定する。
  initialColor: Color;
  // 主成分カードの配分と色生成規則を固定する。
  colorDeckPolicy: DominantChannelDeckPolicy;
  // 山札のカード種類ごとの出現率を固定する。
  cardTypeDistribution: CardTypeDistribution;
  // 超過成分の扱い方を固定する。
  overflowPolicy: OverflowPolicy;
  // 採点方法を固定する。
  scorePolicy: ScorePolicy;
}>;

// 1ゲームで固定して使用する生成・超過・採点ルール一式。
export class GameRules {
  readonly id: GameRuleId;
  readonly totalRounds: number;
  readonly deckSize: number;
  readonly cardOfferSize: CardOfferSize;
  readonly initialColor: Color;
  readonly colorDeckPolicy: DominantChannelDeckPolicy;
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
      args.initialColor.red > Hand.CHANNEL_LIMIT ||
      args.initialColor.green > Hand.CHANNEL_LIMIT ||
      args.initialColor.blue > Hand.CHANNEL_LIMIT
    ) {
      throw new RangeError('Initial colors must fit within the hand limit.');
    }

    this.id = args.id;
    this.totalRounds = args.totalRounds;
    this.deckSize = args.deckSize;
    this.cardOfferSize = args.cardOfferSize;
    this.initialColor = args.initialColor;
    this.colorDeckPolicy = args.colorDeckPolicy;
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
      initialColor: Color.black(),
      colorDeckPolicy: GameRules.createColorDeckPolicy(),
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
      initialColor: Color.white(),
      colorDeckPolicy: GameRules.createColorDeckPolicy(),
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
      initialColor: Color.black(),
      colorDeckPolicy: GameRules.createColorDeckPolicy(),
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
      initialColor: Color.black(),
      colorDeckPolicy: GameRules.createColorDeckPolicy(),
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

  // 標準の主成分カード生成規則を組み立てる。
  private static createColorDeckPolicy(): DominantChannelDeckPolicy {
    return new DominantChannelDeckPolicy({
      dominantChannelRange: IntegerRange.create(40, 120),
      supportingChannelRange: IntegerRange.create(0, 20),
    });
  }
}
