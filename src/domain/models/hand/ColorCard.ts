import { Color } from '../color/Color';

// 色カードを生成できなかった理由を示す。
export enum ColorCardCreationFailure {
  // カードを識別するIDが空である。
  EmptyId = 'emptyId',
  // 色成分がカードとして許可された範囲外である。
  InvalidChannel = 'invalidChannel',
  // すべての色成分が0で、効果のない黒いカードである。
  Black = 'black',
}

// 山札に入り、手札へ加算できる色と識別子を保持するモデル。
export class ColorCard {
  static readonly MINIMUM_CHANNEL = 0;
  static readonly MAXIMUM_CHANNEL = 160;

  // 検証済みのIDと色を持つカードを組み立てる。
  private constructor(
    readonly id: string,
    readonly color: Color,
  ) { }

  // IDと色成分を検証し、カードまたは生成失敗理由を返す。
  static create(
    id: string,
    red: number,
    green: number,
    blue: number,
  ): ColorCard | ColorCardCreationFailure {
    if (id.trim().length === 0) return ColorCardCreationFailure.EmptyId;

    const color = Color.create(red, green, blue);
    if (!(color instanceof Color)) {
      return ColorCardCreationFailure.InvalidChannel;
    }
    if (
      [color.red, color.green, color.blue].some(
        (channel) => channel > ColorCard.MAXIMUM_CHANNEL,
      )
    ) {
      return ColorCardCreationFailure.InvalidChannel;
    }
    if (color.isBlack()) return ColorCardCreationFailure.Black;
    return new ColorCard(id, color);
  }
}
