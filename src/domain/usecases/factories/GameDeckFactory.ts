import type { CardColorAmount } from '../../models/card/CardColorAmount';
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
import { ColorAdjustment } from '../../models/color/ColorAdjustment';
import { COLOR_CHANNELS } from '../../models/color/ColorChannel';
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

// 注入された乱数供給源を使い、ルールに従うカードと山札を生成するFactory。
export class GameDeckFactory {
  // 山札生成中に共有する乱数供給源を保持する。
  constructor(private readonly randomSource: RandomSource) {}

  // 指定ラウンドのルールに従う山札一式を生成する。
  create(args: {
    rules: GameRules;
    roundNumber: RoundNumber;
  }): readonly GameCard[] {
    const kinds = Array.from({ length: args.rules.deckSize }, () =>
      args.rules.cardTypeDistribution.choose(this.randomSource),
    );
    const amounts = args.rules.colorDeckPolicy.generateAmounts({
      cardKinds: kinds,
      randomSource: this.randomSource,
    });
    let amountIndex = 0;
    const deck = kinds.map((kind, index) => {
      const id = createCardId(
        `round-${args.roundNumber.value}-card-${index + 1}`,
      );
      if (
        kind === CardEffectKind.AddColor ||
        kind === CardEffectKind.SubtractColor
      ) {
        const amount = amounts[amountIndex];
        amountIndex += 1;
        if (amount === undefined) {
          throw new RangeError(
            'The color deck policy returned too few colors.',
          );
        }
        return this.createColorCard({ id, kind, amount });
      }
      return this.createSpecialCard({ id, kind });
    });

    this.shuffle(deck);
    return deck;
  }

  // 生成済みのRGB変化量を、指定された加算または減算Effectへ渡す。
  private createColorCard(args: {
    id: GameCardId;
    kind: CardEffectKind.AddColor | CardEffectKind.SubtractColor;
    amount: CardColorAmount;
  }): GameCard {
    const effect =
      args.kind === CardEffectKind.AddColor
        ? new AddColorEffect(args.amount)
        : new SubtractColorEffect(args.amount);
    return new GameCard({ id: args.id, effect });
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
    id: GameCardId;
    kind: Exclude<
      CardEffectKind,
      CardEffectKind.AddColor | CardEffectKind.SubtractColor
    >;
  }): GameCard {
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

    return new GameCard({ id: args.id, effect });
  }
}
