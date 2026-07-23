import type { CardColorAmount } from '../CardColorAmount';
import { HandChangeStatus } from '../../hand/Hand';
import {
  createHandEffectResult,
  CardEffectKind,
  type CardEffectContract,
  type CardEffectContext,
  type CardEffectResult,
} from './CardEffect';

// RGB各成分を現在のHandから減算するカード効果。
export class SubtractColorEffect implements CardEffectContract {
  readonly kind = CardEffectKind.SubtractColor;

  // RGBから取り除く各成分量を保持する。
  constructor(readonly amount: CardColorAmount) {}

  // 減算量をHandへ渡し、Hand側の下限・バーストルールを適用する。
  applyTo(context: CardEffectContext): CardEffectResult {
    const subtraction = context.hand.subtractColor(
      this.amount.color,
      context.overflowPolicy,
    );
    if (
      subtraction.status === HandChangeStatus.Burst &&
      context.canPreventBurst
    ) {
      const prevented = context.hand.subtractColor(
        this.amount.color,
        context.overflowPolicy,
        true,
      );
      return createHandEffectResult(prevented.hand, null, true);
    }
    return createHandEffectResult(
      subtraction.status === HandChangeStatus.Burst
        ? context.hand
        : subtraction.hand,
      subtraction.status === HandChangeStatus.Burst ? subtraction.hand : null,
      false,
    );
  }
}
