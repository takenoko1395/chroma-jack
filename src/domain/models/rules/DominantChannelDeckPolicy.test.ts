import { describe, expect, it } from 'vitest';
import { FixedRandomSource } from '../../../test/helpers/FixedRandomSource';
import { CardEffectKind } from '../card/effects/CardEffect';
import { IntegerRange } from '../shared/IntegerRange';
import { DominantChannelDeckPolicy } from './DominantChannelDeckPolicy';

// テスト用の固定値から検証済み整数範囲を生成する。
function createRange(minimum: number, maximum: number): IntegerRange {
  const range = IntegerRange.create(minimum, maximum);
  if (!(range instanceof IntegerRange)) {
    throw new RangeError(`Invalid test range: ${range}`);
  }
  return range;
}

// テスト対象となる主成分山札Policyを生成する。
function createPolicy(): DominantChannelDeckPolicy {
  return new DominantChannelDeckPolicy({
    dominantChannelRange: createRange(40, 120),
    supportingChannelRange: createRange(0, 20),
  });
}

describe('DominantChannelDeckPolicy', () => {
  it('主成分を均等に配り、それぞれの主成分だけを強く生成する', () => {
    const amounts = createPolicy().generateAmounts({
      cardKinds: Array.from({ length: 6 }, () => CardEffectKind.AddColor),
      randomSource: new FixedRandomSource([0, 20, 120]),
    });
    const dominantCounts = { red: 0, green: 0, blue: 0 };

    amounts.forEach((amount) => {
      const channels = [amount.red, amount.green, amount.blue];
      expect(channels.filter((channel) => channel > 20)).toHaveLength(1);
      const largest = Math.max(...channels);
      if (amount.red === largest) dominantCounts.red += 1;
      if (amount.green === largest) dominantCounts.green += 1;
      if (amount.blue === largest) dominantCounts.blue += 1;
    });

    expect(dominantCounts).toEqual({ red: 2, green: 2, blue: 2 });
  });

  it('主成分と補助成分の強さが重なる設定を拒否する', () => {
    expect(
      () =>
        new DominantChannelDeckPolicy({
          dominantChannelRange: createRange(20, 120),
          supportingChannelRange: createRange(0, 20),
        }),
    ).toThrow(RangeError);
  });

  it('カード色に使用できない負数範囲を拒否する', () => {
    expect(
      () =>
        new DominantChannelDeckPolicy({
          dominantChannelRange: createRange(40, 120),
          supportingChannelRange: createRange(-1, 20),
        }),
    ).toThrow(RangeError);
  });
});
