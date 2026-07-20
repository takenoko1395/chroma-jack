import { describe, expect, it } from 'vitest';
import { FixedRandomSource } from '../../../test/helpers/FixedRandomSource';
import { CardEffectKind } from '../card/effects/CardEffect';
import {
  CardTypeDistribution,
  createCardTypeWeights,
} from './CardTypeDistribution';

describe('CardTypeDistribution', () => {
  it('設定した相対ウェイトの区間からカード種類を選ぶ', () => {
    const distribution = new CardTypeDistribution(
      createCardTypeWeights({ addColor: 2, preventBurst: 1 }),
    );

    expect(distribution.choose(new FixedRandomSource([1]))).toBe(
      CardEffectKind.AddColor,
    );
    expect(distribution.choose(new FixedRandomSource([3]))).toBe(
      CardEffectKind.PreventBurst,
    );
  });

  it('負のウェイトと全種類0を拒否する', () => {
    expect(
      () => new CardTypeDistribution(createCardTypeWeights({ addColor: -1 })),
    ).toThrow(RangeError);
    expect(() => new CardTypeDistribution(createCardTypeWeights({}))).toThrow(
      RangeError,
    );
  });

  it('合計が安全な整数を超えるウェイトを拒否する', () => {
    expect(
      () =>
        new CardTypeDistribution(
          createCardTypeWeights({
            addColor: Number.MAX_SAFE_INTEGER,
            preventBurst: 1,
          }),
        ),
    ).toThrow(RangeError);
  });
});
