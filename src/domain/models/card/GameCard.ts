import { Color } from '../color/Color';
import type { Hand, HandAddition } from '../hand/Hand';
import type { OverflowPolicy } from '../rules/OverflowPolicy';
import { AddColorEffect } from './effects/AddColorEffect';
import type { CardEffect } from './effects/CardEffect';

// ゲームカードを生成できなかった理由を示す。
export enum GameCardCreationFailure {
  // カードを識別するIDが空である。
  EmptyId = 'emptyId',
  // 色成分がカードとして許可された範囲外である。
  InvalidChannel = 'invalidChannel',
  // すべての色成分が0で、効果のない黒いカードである。
  Black = 'black',
}

// 候補として表示する色と、使用時に実行する効果を組み合わせたカードモデル。
export class GameCard {
  static readonly MINIMUM_CHANNEL = 0;
  static readonly MAXIMUM_CHANNEL = 160;

  readonly id: string;
  readonly displayColor: Color;
  readonly effect: CardEffect;

  // 検証済みの識別子、表示色、効果を持つカードを組み立てる。
  private constructor(args: {
    id: string;
    displayColor: Color;
    effect: CardEffect;
  }) {
    this.id = args.id;
    this.displayColor = args.displayColor;
    this.effect = args.effect;
  }

  // RGB加算カードの入力を検証し、カードまたは生成失敗理由を返す。
  static createAddColor(
    id: string,
    red: number,
    green: number,
    blue: number,
  ): GameCard | GameCardCreationFailure {
    if (id.trim().length === 0) return GameCardCreationFailure.EmptyId;

    const color = Color.create(red, green, blue);
    if (!(color instanceof Color)) {
      return GameCardCreationFailure.InvalidChannel;
    }
    if (
      [color.red, color.green, color.blue].some(
        (channel) => channel > GameCard.MAXIMUM_CHANNEL,
      )
    ) {
      return GameCardCreationFailure.InvalidChannel;
    }
    if (color.isBlack()) return GameCardCreationFailure.Black;
    return new GameCard({
      id,
      displayColor: color,
      effect: new AddColorEffect(color),
    });
  }

  // 保持する効果へHandの変更処理を委譲する。
  applyTo(hand: Hand, overflowPolicy: OverflowPolicy): HandAddition {
    return this.effect.applyTo(hand, overflowPolicy);
  }
}
