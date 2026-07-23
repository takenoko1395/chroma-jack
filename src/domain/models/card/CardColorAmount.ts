import { Color } from '../color/Color';

// カード色変化量を生成できなかった理由を示す。
export enum CardColorAmountCreationFailure {
  // 全成分が0で、色を変化させない。
  Empty = 'empty',
  // いずれかの成分がカードで許可する上限を超える。
  ChannelTooLarge = 'channelTooLarge',
}

// カードへ適用できる非空のRGB変化量を保持するValue Object。
export class CardColorAmount {
  static readonly MAXIMUM_CHANNEL = 160;

  // 検証済みのRGB変化量を保持する。
  private constructor(readonly color: Color) {}

  // カードが赤成分へ与える変化量を返す。
  get red(): number {
    return this.color.red;
  }

  // カードが緑成分へ与える変化量を返す。
  get green(): number {
    return this.color.green;
  }

  // カードが青成分へ与える変化量を返す。
  get blue(): number {
    return this.color.blue;
  }

  // RGBをカード用の制約で検証し、変化量または生成失敗理由を返す。
  static create(
    color: Color,
  ): CardColorAmount | CardColorAmountCreationFailure {
    if (color.isBlack()) return CardColorAmountCreationFailure.Empty;
    if (
      [color.red, color.green, color.blue].some(
        (channel) => channel > CardColorAmount.MAXIMUM_CHANNEL,
      )
    ) {
      return CardColorAmountCreationFailure.ChannelTooLarge;
    }
    return new CardColorAmount(color);
  }
}
