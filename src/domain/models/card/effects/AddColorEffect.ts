import type { CardColorAmount } from '../CardColorAmount';
import { HandChangeStatus } from '../../hand/Hand';
import {
  createHandEffectResult,
  CardEffectKind,
  type CardEffectContract,
  type CardEffectContext,
  type CardEffectResult,
} from './CardEffect';

// RGB各成分を現在のHandへ加算するカード効果。
export class AddColorEffect implements CardEffectContract {
  readonly kind = CardEffectKind.AddColor;
  // RGB各成分へ加える量を保持する。
  constructor(readonly amount: CardColorAmount) {}

  // 加算量をHandへ渡し、Hand側の上限・バーストルールを適用する。
  applyTo(context: CardEffectContext): CardEffectResult {
    const addition = context.hand.addColor(
      this.amount.color,
      context.overflowPolicy,
    );
    if (addition.status === HandChangeStatus.Burst && context.canPreventBurst) {
      const prevented = context.hand.changeColor(
        addition.hand.color,
        context.overflowPolicy,
        true,
      );
      return createHandEffectResult(prevented.hand, null, true);
    }
    return createHandEffectResult(
      addition.status === HandChangeStatus.Burst ? context.hand : addition.hand,
      addition.status === HandChangeStatus.Burst ? addition.hand : null,
      false,
    );
  }
}
