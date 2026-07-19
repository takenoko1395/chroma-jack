export enum ColorCreationFailure {
  NotInteger = 'notInteger',
  NegativeChannel = 'negativeChannel',
}

export class Color {
  private constructor(
    readonly red: number,
    readonly green: number,
    readonly blue: number,
  ) {}

  static create(
    red: number,
    green: number,
    blue: number,
  ): Color | ColorCreationFailure {
    if (
      !Number.isSafeInteger(red) ||
      !Number.isSafeInteger(green) ||
      !Number.isSafeInteger(blue)
    ) {
      return ColorCreationFailure.NotInteger;
    }
    if (red < 0 || green < 0 || blue < 0) {
      return ColorCreationFailure.NegativeChannel;
    }
    return new Color(red, green, blue);
  }

  add(other: Color): Color {
    const added = new Color(
      this.red + other.red,
      this.green + other.green,
      this.blue + other.blue,
    );

    return added;
  }

  isBlack(): boolean {
    return this.red === 0 && this.green === 0 && this.blue === 0;
  }
}
