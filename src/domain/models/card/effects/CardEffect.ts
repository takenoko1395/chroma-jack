import type { Hand, HandAddition } from '../../hand/Hand';
import type { OverflowPolicy } from '../../rules/OverflowPolicy';

// カードごとの効果をHandへ適用する振る舞いを定義する。
export interface CardEffect {
  applyTo(hand: Hand, overflowPolicy: OverflowPolicy): HandAddition;
}
