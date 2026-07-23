import {
  CardColorAmount,
  CardColorAmountCreationFailure,
} from '../../models/card/CardColorAmount';
import { GameCard } from '../../models/card/GameCard';
import { GameCardId } from '../../models/card/GameCardId';
import { AddColorEffect } from '../../models/card/effects/AddColorEffect';
import { AdjustBrightnessEffect } from '../../models/card/effects/AdjustBrightnessEffect';
import { AdjustColorEffect } from '../../models/card/effects/AdjustColorEffect';
import { AdjustSaturationEffect } from '../../models/card/effects/AdjustSaturationEffect';
import {
  CardEffectKind,
  type CardEffect,
} from '../../models/card/effects/CardEffect';
import {
  PreventBurstEffect,
  RevealColorValuesEffect,
} from '../../models/card/effects/RoundModifierEffects';
import { SwapColorChannelsEffect } from '../../models/card/effects/SwapColorChannelsEffect';
import { SubtractColorEffect } from '../../models/card/effects/SubtractColorEffect';
import { Color } from '../../models/color/Color';
import { ColorAdjustment } from '../../models/color/ColorAdjustment';
import { COLOR_CHANNELS, ColorChannel } from '../../models/color/ColorChannel';
import { ColorDeckMode } from '../../models/rules/ColorDeckMode';
import type { GameRules } from '../../models/rules/GameRules';
import type { RoundNumber } from '../../models/game/RoundNumber';
import { IntegerRange } from '../../models/shared/IntegerRange';
import type { RandomSource } from '../gateway/RandomSource';

// 内部生成用の整数範囲を検証済みValue Objectへ変換する。
function createRange(minimum: number, maximum: number): IntegerRange {
  const range = IntegerRange.create(minimum, maximum);
  if (!(range instanceof IntegerRange)) {
    throw new RangeError(`Invalid internal range: ${range}`);
  }
  return range;
}

// Factory内部で組み立てた文字列を検証済みカードIDへ変換する。
function createCardId(value: string): GameCardId {
  const id = GameCardId.create(value);
  if (!(id instanceof GameCardId)) {
    throw new RangeError(`Invalid generated card id: ${id}`);
  }
  return id;
}

// 乱数から得たRGB成分を検証済みColorへ変換する。
function createColor(red: number, green: number, blue: number): Color {
  const color = Color.create(red, green, blue);
  if (!(color instanceof Color)) {
    throw new RangeError(`Invalid generated color: ${color}`);
  }
  return color;
}

// 検証済みColorをカードで使用可能な変化量へ変換する。
function createCardColorAmount(color: Color): CardColorAmount {
  const amount = CardColorAmount.create(color);
  if (!(amount instanceof CardColorAmount)) {
    throw new RangeError(`Invalid generated card color: ${amount}`);
  }
  return amount;
}

// 注入された乱数供給源を使い、ルールに従うカードと山札を生成するFactory。
export class GameDeckFactory {
  private static readonly STRONG_COMPONENT_RANGE = createRange(40, 120);
  private static readonly SUPPORT_CHANNEL_RANGE = createRange(0, 20);

  // 山札生成中に共有する乱数供給源を保持する。
  constructor(private readonly randomSource: RandomSource) {}

  // 指定ラウンドのルールに従う山札一式を生成する。
  create(args: {
    rules: GameRules;
    roundNumber: RoundNumber;
  }): readonly GameCard[] {
    switch (args.rules.colorDeckMode) {
      case ColorDeckMode.BalancedChannels:
        return this.createBalancedDeck(args);
      case ColorDeckMode.RandomMixed:
        return Array.from({ length: args.rules.deckSize }, (_, index) =>
          this.createCard({
            rules: args.rules,
            roundNumber: args.roundNumber,
            cardNumber: index + 1,
          }),
        );
    }
  }

  // カード生成Policyを使い、黒ではない通常カードまたは特殊カードを生成する。
  private createCard(args: {
    rules: GameRules;
    roundNumber: RoundNumber;
    cardNumber: number;
  }): GameCard {
    const kind = args.rules.cardTypeDistribution.choose(this.randomSource);
    if (
      kind !== CardEffectKind.AddColor &&
      kind !== CardEffectKind.SubtractColor
    ) {
      return this.createSpecialCard({ ...args, kind });
    }
    const { cardColorRange, cardColorGenerationPolicy } = args.rules;
    const id = createCardId(
      `round-${args.roundNumber.value}-card-${args.cardNumber}`,
    );
    const generatedColor = cardColorGenerationPolicy.generateColor(
      cardColorRange,
      this.randomSource,
    );
    const amountResult = CardColorAmount.create(generatedColor);
    const amount =
      amountResult === CardColorAmountCreationFailure.Empty
        ? createCardColorAmount(
            createColor(
              generatedColor.red,
              generatedColor.green,
              cardColorRange.maximum,
            ),
          )
        : amountResult;
    if (!(amount instanceof CardColorAmount)) {
      throw new RangeError(`Random source returned an invalid card: ${amount}`);
    }
    const effect =
      kind === CardEffectKind.AddColor
        ? new AddColorEffect(amount)
        : new SubtractColorEffect(amount);
    return new GameCard({ id, effect });
  }

  // RGB変化量の主成分を同数含み、Effectで加算・減算を決める山札を生成する。
  private createBalancedDeck(args: {
    rules: GameRules;
    roundNumber: RoundNumber;
  }): readonly GameCard[] {
    const cardsPerChannel = args.rules.deckSize / COLOR_CHANNELS.length;
    const channels = COLOR_CHANNELS.flatMap((channel) =>
      Array.from({ length: cardsPerChannel }, () => channel),
    );
    const deck = channels.map((channel, index) =>
      this.createBalancedColorCard({
        id: createCardId(`round-${args.roundNumber.value}-card-${index + 1}`),
        channel,
        kind: args.rules.cardTypeDistribution.choose(this.randomSource),
      }),
    );

    this.shuffle(deck);
    return deck;
  }

  // 主成分つきのRGB変化量を、指定された加算または減算Effectへ渡す。
  private createBalancedColorCard(args: {
    id: GameCardId;
    channel: ColorChannel;
    kind: CardEffectKind;
  }): GameCard {
    if (
      args.kind !== CardEffectKind.AddColor &&
      args.kind !== CardEffectKind.SubtractColor
    ) {
      throw new RangeError(
        'Balanced color decks support only add or subtract effects.',
      );
    }
    const amount = createCardColorAmount(
      this.createChannelAmounts(args.channel),
    );
    const effect =
      args.kind === CardEffectKind.AddColor
        ? new AddColorEffect(amount)
        : new SubtractColorEffect(amount);
    return new GameCard({ id: args.id, effect });
  }

  // 主成分とほかの成分に、それぞれの範囲からRGB変化量を割り当てる。
  private createChannelAmounts(primary: ColorChannel): Color {
    return createColor(
      this.createChannelAmount(primary, ColorChannel.Red),
      this.createChannelAmount(primary, ColorChannel.Green),
      this.createChannelAmount(primary, ColorChannel.Blue),
    );
  }

  // 対象が主成分かどうかに応じて強い量または弱い揺らぎを生成する。
  private createChannelAmount(
    primary: ColorChannel,
    channel: ColorChannel,
  ): number {
    return this.randomSource.nextInteger(
      primary === channel
        ? GameDeckFactory.STRONG_COMPONENT_RANGE
        : GameDeckFactory.SUPPORT_CHANNEL_RANGE,
    );
  }

  // 山札内の枚数を維持したまま公開順をランダムに並べ替える。
  private shuffle(deck: GameCard[]): void {
    for (let index = deck.length - 1; index > 0; index -= 1) {
      const swapIndex = this.randomSource.nextInteger(createRange(0, index));
      [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
    }
  }

  // 選ばれた種類に応じ、固有値を持つ特殊効果カードを生成する。
  private createSpecialCard(args: {
    roundNumber: RoundNumber;
    cardNumber: number;
    kind: Exclude<
      CardEffectKind,
      CardEffectKind.AddColor | CardEffectKind.SubtractColor
    >;
  }): GameCard {
    const id = createCardId(
      `round-${args.roundNumber.value}-card-${args.cardNumber}`,
    );
    const channelIndex = this.randomSource.nextInteger(createRange(0, 2));
    const direction =
      this.randomSource.nextInteger(createRange(0, 1)) === 0 ? -1 : 1;
    let effect: CardEffect;

    switch (args.kind) {
      case CardEffectKind.AdjustChannels: {
        const channel = COLOR_CHANNELS[channelIndex];
        const delta = { red: 0, green: 0, blue: 0 };
        delta[channel] = direction * 32;
        const adjustment = ColorAdjustment.create(delta);
        if (!(adjustment instanceof ColorAdjustment)) {
          throw new RangeError(`Invalid generated adjustment: ${adjustment}`);
        }
        effect = new AdjustColorEffect(adjustment);
        break;
      }
      case CardEffectKind.SwapChannels: {
        const first = COLOR_CHANNELS[channelIndex];
        const second =
          COLOR_CHANNELS[(channelIndex + 1) % COLOR_CHANNELS.length];
        effect = new SwapColorChannelsEffect(first, second);
        break;
      }
      case CardEffectKind.AdjustSaturation:
        effect = new AdjustSaturationEffect(direction > 0 ? 130 : 70);
        break;
      case CardEffectKind.AdjustBrightness:
        effect = new AdjustBrightnessEffect(direction * 32);
        break;
      case CardEffectKind.RevealColorValues:
        effect = new RevealColorValuesEffect();
        break;
      case CardEffectKind.PreventBurst:
        effect = new PreventBurstEffect();
        break;
    }

    return new GameCard({ id, effect });
  }
}
