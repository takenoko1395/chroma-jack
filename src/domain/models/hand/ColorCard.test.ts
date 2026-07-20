import { describe, expect, it } from 'vitest';
import { ColorCard, ColorCardCreationFailure } from './ColorCard';

describe('ColorCard', () => {
  it('0〜160の各成分を持つ黒以外のカードを生成できる', () => {
    expect(ColorCard.create('card', 0, 10, 160)).toBeInstanceOf(ColorCard);
  });

  it.each([
    ['', 1, 1, 1, ColorCardCreationFailure.EmptyId],
    ['card', -1, 1, 1, ColorCardCreationFailure.InvalidChannel],
    ['card', 161, 1, 1, ColorCardCreationFailure.InvalidChannel],
    ['card', 0.5, 1, 1, ColorCardCreationFailure.InvalidChannel],
    ['card', 0, 0, 0, ColorCardCreationFailure.Black],
  ])('不正なカードは対応するenumを返す', (id, red, green, blue, expected) => {
    expect(ColorCard.create(id, red, green, blue)).toBe(expected);
  });
});
