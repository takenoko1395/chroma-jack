import { describe, expect, it } from 'vitest';
import { ColorChannel } from '../../color/ColorChannel';
import { Hand } from '../../hand/Hand';
import { OverflowPolicy } from '../../rules/OverflowPolicy';
import { AdjustBrightnessEffect } from './AdjustBrightnessEffect';
import { AdjustColorEffect } from './AdjustColorEffect';
import { AdjustSaturationEffect } from './AdjustSaturationEffect';
import type { CardEffectContext } from './CardEffect';
import { SwapColorChannelsEffect } from './SwapColorChannelsEffect';
import {
  createColor,
  createColorAdjustment,
} from '../../../../test/helpers/createDomainValue';

// 指定色を持つカード効果テスト用Contextを生成する。
function createContext(
  red: number,
  green: number,
  blue: number,
): CardEffectContext {
  return {
    hand: new Hand(createColor(red, green, blue)),
    overflowPolicy: OverflowPolicy.classic(),
    canPreventBurst: false,
  };
}

describe('color card effects', () => {
  it('RGBの一部を増減し、減算結果を0で止める', () => {
    const result = new AdjustColorEffect(
      createColorAdjustment({ red: 20, green: -30, blue: 0 }),
    ).applyTo(createContext(10, 20, 30));

    expect(result.hand.color).toMatchObject({ red: 30, green: 0, blue: 30 });
  });

  it('検証済みRGB差分をそのまま効果へ保持する', () => {
    const adjustment = createColorAdjustment({ red: 20, green: 0, blue: 0 });
    const effect = new AdjustColorEffect(adjustment);

    const result = effect.applyTo(createContext(10, 20, 30));

    expect(effect.delta).toBe(adjustment);
    expect(result.hand.color.red).toBe(30);
  });

  it('指定された2つの色成分を交換する', () => {
    const result = new SwapColorChannelsEffect(
      ColorChannel.Red,
      ColorChannel.Blue,
    ).applyTo(createContext(10, 20, 30));

    expect(result.hand.color).toMatchObject({ red: 30, green: 20, blue: 10 });
  });

  it('彩度倍率によってRGB成分差を広げる', () => {
    const result = new AdjustSaturationEffect(130).applyTo(
      createContext(100, 120, 140),
    );

    expect(result.hand.color.red).toBeLessThan(100);
    expect(result.hand.color.blue).toBeGreaterThan(140);
  });

  it('明度を全成分へ加算し255で止める', () => {
    const result = new AdjustBrightnessEffect(32).applyTo(
      createContext(240, 100, 0),
    );

    expect(result.hand.color).toMatchObject({ red: 255, green: 132, blue: 32 });
  });
});
