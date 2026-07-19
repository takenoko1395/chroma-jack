import { Color } from '../color/Color';

export enum ColorCardCreationFailure {
  EmptyId = 'emptyId',
  InvalidChannel = 'invalidChannel',
  Black = 'black',
}

export class ColorCard {
  static readonly MINIMUM_CHANNEL = 0;
  static readonly MAXIMUM_CHANNEL = 63;

  private constructor(
    readonly id: string,
    readonly color: Color,
  ) {}

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
