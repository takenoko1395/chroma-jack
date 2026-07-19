export enum IntegerRangeCreationFailure {
  NotInteger = 'notInteger',
  MinimumExceedsMaximum = 'minimumExceedsMaximum',
}

export class IntegerRange {
  private constructor(
    readonly minimum: number,
    readonly maximum: number,
  ) {}

  static create(
    minimum: number,
    maximum: number,
  ): IntegerRange | IntegerRangeCreationFailure {
    if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum)) {
      return IntegerRangeCreationFailure.NotInteger;
    }
    if (minimum > maximum) {
      return IntegerRangeCreationFailure.MinimumExceedsMaximum;
    }
    return new IntegerRange(minimum, maximum);
  }

  contains(value: number): boolean {
    return (
      Number.isSafeInteger(value) &&
      value >= this.minimum &&
      value <= this.maximum
    );
  }
}
