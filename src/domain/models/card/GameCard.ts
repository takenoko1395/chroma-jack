import type { Hand } from '../hand/Hand';
import type { OverflowPolicy } from '../rules/OverflowPolicy';
import type { CardEffect, CardEffectResult } from './effects/CardEffect';
import type { GameCardId } from './GameCardId';

// 識別子と使用時に実行する効果だけを保持するカードモデル。
export class GameCard {
  readonly id: GameCardId;
  readonly effect: CardEffect;

  // 検証済みの識別子とカード効果を保持する。
  constructor(args: { id: GameCardId; effect: CardEffect }) {
    this.id = args.id;
    this.effect = args.effect;
  }

  // 保持する効果へ現在のラウンド条件とHandの変更処理を委譲する。
  applyTo(args: {
    hand: Hand;
    overflowPolicy: OverflowPolicy;
    canPreventBurst: boolean;
  }): CardEffectResult {
    return this.effect.applyTo(args);
  }
}
