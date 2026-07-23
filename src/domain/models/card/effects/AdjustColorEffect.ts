import type { ColorAdjustment } from '../../color/ColorAdjustment';
import { HandChangeStatus } from '../../hand/Hand';
import {
  createHandEffectResult,
  CardEffectKind,
  type CardEffectContract,
  type CardEffectContext,
  type CardEffectResult,
} from './CardEffect';

// RGB成分ごとの増減量を現在色へ反映するカード効果。
export class AdjustColorEffect implements CardEffectContract {
  readonly kind = CardEffectKind.AdjustChannels;
  readonly delta: ColorAdjustment;

  // 検証済みのRGB差分を保持する。
  constructor(delta: ColorAdjustment) {
    this.delta = delta;
  }

  // 各成分を0未満にしないよう変更し、上限超過ルールを適用する。
  applyTo(context: CardEffectContext): CardEffectResult {
    const color = context.hand.color.mapChannels((value, channel) =>
      Math.max(0, value + this.delta[channel]),
    );
    const change = context.hand.changeColor(color, context.overflowPolicy);
    if (change.status === HandChangeStatus.Burst && context.canPreventBurst) {
      const prevented = context.hand.changeColor(
        color,
        context.overflowPolicy,
        true,
      );
      return createHandEffectResult(prevented.hand, null, true);
    }
    return createHandEffectResult(
      change.status === HandChangeStatus.Burst ? context.hand : change.hand,
      change.status === HandChangeStatus.Burst ? change.hand : null,
      false,
    );
  }
}
