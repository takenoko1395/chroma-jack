import { CardColorAmount } from '../card/CardColorAmount';
import { CardEffectKind } from '../card/effects/CardEffect';
import { Color } from '../color/Color';
import { COLOR_CHANNELS, ColorChannel } from '../color/ColorChannel';
import type { RandomSource } from '../../usecases/gateway/RandomSource';
import { IntegerRange } from '../shared/IntegerRange';

// 内部生成用の整数範囲を検証済みValue Objectへ変換する。
function createRange(minimum: number, maximum: number): IntegerRange {
  const range = IntegerRange.create(minimum, maximum);
  if (!(range instanceof IntegerRange)) {
    throw new RangeError(`Invalid internal range: ${range}`);
  }
  return range;
}

// 主成分を均等に配り、主成分を強くしたカード色を生成する山札Policy。
export class DominantChannelDeckPolicy {
  readonly dominantChannelRange: IntegerRange;
  readonly supportingChannelRange: IntegerRange;

  // 主成分が必ずほかの成分より強くなる2つの生成範囲を保持する。
  constructor(args: {
    dominantChannelRange: IntegerRange;
    supportingChannelRange: IntegerRange;
  }) {
    if (
      args.dominantChannelRange.minimum <= args.supportingChannelRange.maximum
    ) {
      throw new RangeError(
        'The dominant channel range must be stronger than the supporting channel range.',
      );
    }
    if (
      args.dominantChannelRange.minimum < 0 ||
      args.supportingChannelRange.minimum < 0 ||
      args.dominantChannelRange.maximum > CardColorAmount.MAXIMUM_CHANNEL ||
      args.supportingChannelRange.maximum > CardColorAmount.MAXIMUM_CHANNEL
    ) {
      throw new RangeError('Generated channels must fit within card limits.');
    }

    this.dominantChannelRange = args.dominantChannelRange;
    this.supportingChannelRange = args.supportingChannelRange;
  }

  // 必要枚数へ主成分をできるだけ均等に割り当てたカード色を生成する。
  generateAmounts(args: {
    cardKinds: readonly CardEffectKind[];
    randomSource: RandomSource;
  }): readonly CardColorAmount[] {
    const colorCardCount = args.cardKinds.filter(
      (kind) =>
        kind === CardEffectKind.AddColor ||
        kind === CardEffectKind.SubtractColor,
    ).length;
    if (colorCardCount === 0) return [];

    const firstChannelIndex = args.randomSource.nextInteger(
      createRange(0, COLOR_CHANNELS.length - 1),
    );
    return Array.from({ length: colorCardCount }, (_, index) => {
      const channelIndex = (firstChannelIndex + index) % COLOR_CHANNELS.length;
      return this.generateAmount(
        COLOR_CHANNELS[channelIndex] as ColorChannel,
        args.randomSource,
      );
    });
  }

  // 指定された主成分だけを強くした検証済みカード色変化量を生成する。
  private generateAmount(
    dominantChannel: ColorChannel,
    randomSource: RandomSource,
  ): CardColorAmount {
    const color = Color.create(
      this.generateChannel(ColorChannel.Red, dominantChannel, randomSource),
      this.generateChannel(ColorChannel.Green, dominantChannel, randomSource),
      this.generateChannel(ColorChannel.Blue, dominantChannel, randomSource),
    );
    if (!(color instanceof Color)) {
      throw new RangeError(
        `Random source generated an invalid color: ${color}`,
      );
    }

    const amount = CardColorAmount.create(color);
    if (!(amount instanceof CardColorAmount)) {
      throw new RangeError(
        `Random source generated an invalid card: ${amount}`,
      );
    }
    return amount;
  }

  // 対象成分が主成分かどうかに応じた範囲から値を生成する。
  private generateChannel(
    channel: ColorChannel,
    dominantChannel: ColorChannel,
    randomSource: RandomSource,
  ): number {
    return randomSource.nextInteger(
      channel === dominantChannel
        ? this.dominantChannelRange
        : this.supportingChannelRange,
    );
  }
}
