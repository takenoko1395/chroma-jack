import { GameCard, GameCardCreationFailure } from '../../models/card/GameCard';
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
import { COLOR_CHANNELS, ColorChannel } from '../../models/color/ColorChannel';
import { AddColorDeckMode } from '../../models/rules/AddColorDeckMode';
import type { GameRules } from '../../models/rules/GameRules';
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

// 注入された乱数供給源を使い、ルールに従うカードと山札を生成するFactory。
export class GameDeckFactory {
  private static readonly DOMINANT_CHANNEL_RANGE = createRange(40, 120);
  private static readonly SUPPORT_CHANNEL_RANGE = createRange(0, 20);

  // 山札生成中に共有する乱数供給源を保持する。
  constructor(private readonly randomSource: RandomSource) { }

  // 指定ラウンドのルールに従う山札一式を生成する。
  create(args: { rules: GameRules; roundNumber: number }): readonly GameCard[] {
    return args.rules.addColorDeckMode ===
      AddColorDeckMode.BalancedDominantChannel
      ? this.createBalancedDominantChannelDeck(args)
      : Array.from({ length: args.rules.deckSize }, (_, index) =>
        this.createCard({
          rules: args.rules,
          roundNumber: args.roundNumber,
          cardNumber: index + 1,
        }),
      );
  }

  // カード生成Policyを使い、黒ではない通常カードまたは特殊カードを生成する。
  private createCard(args: {
    rules: GameRules;
    roundNumber: number;
    cardNumber: number;
  }): GameCard {
    const kind = args.rules.cardTypeDistribution.choose(this.randomSource);
    if (kind !== CardEffectKind.AddColor) {
      return this.createSpecialCard({ ...args, kind });
    }
    const { cardColorRange, cardColorGenerationPolicy } = args.rules;
    const id = `round-${args.roundNumber}-card-${args.cardNumber}`;
    const red = cardColorGenerationPolicy.generateChannel(
      cardColorRange,
      this.randomSource,
    );
    const green = cardColorGenerationPolicy.generateChannel(
      cardColorRange,
      this.randomSource,
    );
    const blue = cardColorGenerationPolicy.generateChannel(
      cardColorRange,
      this.randomSource,
    );
    const card = GameCard.createAddColor(id, red, green, blue);

    if (card instanceof GameCard) return card;
    if (card === GameCardCreationFailure.Black) {
      const nonBlackCard = GameCard.createAddColor(id, red, green, 1);
      if (nonBlackCard instanceof GameCard) return nonBlackCard;
    }
    throw new RangeError(`Random source returned an invalid card: ${card}`);
  }

  // 各色を主成分とするカードを同数含む混色カード山札を生成する。
  private createBalancedDominantChannelDeck(args: {
    rules: GameRules;
    roundNumber: number;
  }): readonly GameCard[] {
    const cardsPerChannel = args.rules.deckSize / COLOR_CHANNELS.length;
    const channels = COLOR_CHANNELS.flatMap((channel) =>
      Array.from({ length: cardsPerChannel }, () => channel),
    );
    const deck = channels.map((channel, index) =>
      this.createDominantChannelCard({
        id: `round-${args.roundNumber}-card-${index + 1}`,
        channel,
      }),
    );

    // NOTE: 色ごとの枚数を維持したまま公開順だけをラウンドごとに変える。
    for (let index = deck.length - 1; index > 0; index -= 1) {
      const swapIndex = this.randomSource.nextInteger(createRange(0, index));
      [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
    }
    return deck;
  }

  // 指定成分を主成分とし、他成分には小さな揺らぎを持つ加算カードを生成する。
  private createDominantChannelCard(args: {
    id: string;
    channel: ColorChannel;
  }): GameCard {
    const channels = {
      red: this.randomSource.nextInteger(
        args.channel === ColorChannel.Red
          ? GameDeckFactory.DOMINANT_CHANNEL_RANGE
          : GameDeckFactory.SUPPORT_CHANNEL_RANGE,
      ),
      green: this.randomSource.nextInteger(
        args.channel === ColorChannel.Green
          ? GameDeckFactory.DOMINANT_CHANNEL_RANGE
          : GameDeckFactory.SUPPORT_CHANNEL_RANGE,
      ),
      blue: this.randomSource.nextInteger(
        args.channel === ColorChannel.Blue
          ? GameDeckFactory.DOMINANT_CHANNEL_RANGE
          : GameDeckFactory.SUPPORT_CHANNEL_RANGE,
      ),
    };
    const card = GameCard.createAddColor(
      args.id,
      channels.red,
      channels.green,
      channels.blue,
    );
    if (!(card instanceof GameCard)) {
      throw new RangeError(`Could not create dominant-channel card: ${card}`);
    }
    return card;
  }

  // 選ばれた種類に応じ、固有値を持つ特殊効果カードを生成する。
  private createSpecialCard(args: {
    roundNumber: number;
    cardNumber: number;
    kind: Exclude<CardEffectKind, CardEffectKind.AddColor>;
  }): GameCard {
    const id = `round-${args.roundNumber}-card-${args.cardNumber}`;
    const channelIndex = this.randomSource.nextInteger(createRange(0, 2));
    const direction =
      this.randomSource.nextInteger(createRange(0, 1)) === 0 ? -1 : 1;
    let effect: CardEffect;

    switch (args.kind) {
      case CardEffectKind.AdjustChannels: {
        const channel = COLOR_CHANNELS[channelIndex];
        const delta = { red: 0, green: 0, blue: 0 };
        delta[channel] = direction * 32;
        effect = new AdjustColorEffect(delta);
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

    const card = GameCard.createSpecial({ id, effect });
    if (!(card instanceof GameCard)) {
      throw new RangeError(`Could not create special card: ${card}`);
    }
    return card;
  }
}
