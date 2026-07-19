import { describe, expect, it } from 'vitest';
import { Color } from '../color/Color';
import { ColorCard } from './ColorCard';
import { Hand, HandAdditionStatus } from './Hand';

function createHand(red: number, green: number, blue: number): Hand {
  const color = Color.create(red, green, blue);
  if (!(color instanceof Color)) throw new Error('Invalid test color');
  return new Hand(color);
}

function createCard(red: number, green: number, blue: number): ColorCard {
  const card = ColorCard.create('card', red, green, blue);
  if (!(card instanceof ColorCard)) throw new Error('Invalid test card');
  return card;
}

describe('Hand', () => {
  it('カード加算とバースト判定を自身のロジックとして行う', () => {
    const safeAddition = createHand(250, 250, 250).add(createCard(5, 5, 5));
    expect(safeAddition.status).toBe(HandAdditionStatus.Added);
    expect(safeAddition.hand.color).toMatchObject({
      red: 255,
      green: 255,
      blue: 255,
    });

    const burstAddition = safeAddition.hand.add(createCard(1, 1, 1));
    expect(burstAddition.status).toBe(HandAdditionStatus.Burst);
    expect(burstAddition.hand.color).toMatchObject({
      red: 256,
      green: 256,
      blue: 256,
    });
  });

  it('白を1000点、黒を0点にする', () => {
    expect(createHand(255, 255, 255).calculateScore()).toBe(1000);
    expect(createHand(0, 0, 0).calculateScore()).toBe(0);
  });

  it('バーストしている手札は0点にする', () => {
    expect(createHand(256, 255, 255).calculateScore()).toBe(0);
  });

  it('白に近い色ほど高い整数スコアにする', () => {
    const middle = createHand(100, 100, 100).calculateScore();
    const nearWhite = createHand(230, 230, 230).calculateScore();
    expect(Number.isInteger(middle)).toBe(true);
    expect(nearWhite).toBeGreaterThan(middle);
  });
});
