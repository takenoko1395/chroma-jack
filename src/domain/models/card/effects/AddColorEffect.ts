import type { Color } from '../../color/Color';
import type { Hand, HandAddition } from '../../hand/Hand';
import type { OverflowPolicy } from '../../rules/OverflowPolicy';
import type { CardEffect } from './CardEffect';

// RGB各成分を現在のHandへ加算するカード効果。
export class AddColorEffect implements CardEffect {
  // RGB各成分へ加える量を保持する。
  constructor(readonly amount: Color) {}

  // 加算量をHandへ渡し、Hand側の上限・バーストルールを適用する。
  applyTo(hand: Hand, overflowPolicy: OverflowPolicy): HandAddition {
    return hand.addColor(this.amount, overflowPolicy);
  }
}
