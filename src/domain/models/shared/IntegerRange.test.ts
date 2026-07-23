import { describe, expect, it } from 'vitest';
import { IntegerRange } from './IntegerRange';

describe('IntegerRange', () => {
  it('検証済みの整数範囲を生成する', () => {
    const range = IntegerRange.create(0, 63);
    expect(range).toBeInstanceOf(IntegerRange);
    expect(range.contains(0)).toBe(true);
    expect(range.contains(63)).toBe(true);
    expect(range.contains(64)).toBe(false);
  });

  it('不正な範囲はプログラマーエラーとして拒否する', () => {
    expect(() => IntegerRange.create(0.5, 63)).toThrow(RangeError);
    expect(() => IntegerRange.create(64, 63)).toThrow(RangeError);
  });
});
