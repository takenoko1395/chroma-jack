import { describe, expect, it } from 'vitest';
import {
  createAddColorCard,
  createCardColorAmount,
  createColor,
  createGameCardId,
  createSubtractColorCard,
} from '../../../test/helpers/createDomainValue';
import { Hand } from '../hand/Hand';
import { OverflowPolicy } from '../rules/OverflowPolicy';
import {
  CardColorAmount,
  CardColorAmountCreationFailure,
} from './CardColorAmount';
import { GameCard } from './GameCard';
import { GameCardId, GameCardIdCreationFailure } from './GameCardId';
import { AddColorEffect } from './effects/AddColorEffect';
import { SubtractColorEffect } from './effects/SubtractColorEffect';

describe('GameCard', () => {
  it('検証済みIDとRGB加算効果からカードを生成する', () => {
    const card = new GameCard({
      id: createGameCardId('card'),
      effect: new AddColorEffect(createCardColorAmount(0, 10, 160)),
    });

    expect(card.id.value).toBe('card');
  });

  it('検証済みIDとRGB減算効果からカードを生成する', () => {
    const card = new GameCard({
      id: createGameCardId('card'),
      effect: new SubtractColorEffect(createCardColorAmount(10, 20, 30)),
    });

    expect(card.id.value).toBe('card');
  });

  it('カードIDの生成境界で空文字を拒否する', () => {
    expect(GameCardId.create('  ')).toBe(GameCardIdCreationFailure.Empty);
  });

  it('カード色変化量の生成境界で空と上限超過を拒否する', () => {
    expect(CardColorAmount.create(createColor(0, 0, 0))).toBe(
      CardColorAmountCreationFailure.Empty,
    );
    expect(CardColorAmount.create(createColor(161, 1, 1))).toBe(
      CardColorAmountCreationFailure.ChannelTooLarge,
    );
  });

  it('AddColorEffectを通じてHandへ色を加える', () => {
    const card = createAddColorCard('card', 1, 2, 3);

    const addition = card.applyTo({
      hand: new Hand(createColor(10, 20, 30)),
      overflowPolicy: OverflowPolicy.classic(),
      canPreventBurst: false,
    });

    expect(addition.burstHand).toBeNull();
    expect(addition.hand.color).toMatchObject({ red: 11, green: 22, blue: 33 });
  });

  it('SubtractColorEffectを通じてHandから色を引く', () => {
    const card = createSubtractColorCard('card', 10, 20, 30);

    const subtraction = card.applyTo({
      hand: new Hand(createColor(100, 100, 100)),
      overflowPolicy: OverflowPolicy.classic(),
      canPreventBurst: false,
    });

    expect(subtraction.burstHand).toBeNull();
    expect(subtraction.hand.color).toMatchObject({
      red: 90,
      green: 80,
      blue: 70,
    });
  });
});
