import { describe, expect, it } from 'vitest';
import {
  ColorAdjustment,
  ColorAdjustmentCreationFailure,
} from './ColorAdjustment';

describe('ColorAdjustment', () => {
  it('符号付きのRGB差分を保持する', () => {
    const adjustment = ColorAdjustment.create({
      red: 10,
      green: -20,
      blue: 0,
    });

    expect(adjustment).toBeInstanceOf(ColorAdjustment);
  });

  it('小数と変化のないRGB差分を拒否する', () => {
    expect(ColorAdjustment.create({ red: 0.5, green: 0, blue: 0 })).toBe(
      ColorAdjustmentCreationFailure.NotInteger,
    );
    expect(ColorAdjustment.create({ red: 0, green: 0, blue: 0 })).toBe(
      ColorAdjustmentCreationFailure.Empty,
    );
  });
});
