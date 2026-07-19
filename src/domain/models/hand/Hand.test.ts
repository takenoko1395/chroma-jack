import { describe, expect, it } from 'vitest';
import { Color } from '../color/Color';
import { ColorChannel } from '../color/ColorChannel';
import { OverflowBehavior, OverflowPolicy } from '../rules/OverflowPolicy';
import { ScorePolicy } from '../rules/ScorePolicy';
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
  const endRound = OverflowPolicy.endRound();
  const scoring = new ScorePolicy(1000, 200);

  it('カード加算とバースト判定を自身のロジックとして行う', () => {
    const safeAddition = createHand(250, 250, 250).add(
      createCard(5, 5, 5),
      endRound,
    );
    expect(safeAddition.status).toBe(HandAdditionStatus.Added);
    expect(safeAddition.hand.color).toMatchObject({
      red: 255,
      green: 255,
      blue: 255,
    });

    const burstAddition = safeAddition.hand.add(createCard(1, 1, 1), endRound);
    expect(burstAddition.status).toBe(HandAdditionStatus.Burst);
    expect(burstAddition.hand.color).toMatchObject({
      red: 256,
      green: 256,
      blue: 256,
    });
  });

  it('白を1000点、黒を0点にする', () => {
    expect(scoring.calculate(createHand(255, 255, 255))).toBe(1000);
    expect(scoring.calculate(createHand(0, 0, 0))).toBe(0);
  });

  it('超過成分を255へ固定して続行し、スコア上限を下げる', () => {
    const addition = createHand(250, 255, 255).add(
      createCard(10, 0, 0),
      OverflowPolicy.clampAndContinue(),
    );
    expect(addition.status).toBe(HandAdditionStatus.Added);
    expect(addition.hand.color).toMatchObject({
      red: 255,
      green: 255,
      blue: 255,
    });
    expect(addition.hand.clampedChannels.size).toBe(1);
    expect(scoring.calculate(addition.hand)).toBe(800);
  });

  it('色成分ごとに異なる超過ルールを適用する', () => {
    const policy = new OverflowPolicy({
      red: OverflowBehavior.ClampAndContinue,
      green: OverflowBehavior.EndRound,
      blue: OverflowBehavior.ClampAndContinue,
    });
    const redOverflow = createHand(250, 10, 10).add(
      createCard(10, 0, 0),
      policy,
    );
    expect(redOverflow.status).toBe(HandAdditionStatus.Added);
    expect(redOverflow.hand.color.red).toBe(255);

    const greenOverflow = createHand(10, 250, 10).add(
      createCard(0, 10, 0),
      policy,
    );
    expect(greenOverflow.status).toBe(HandAdditionStatus.Burst);
    expect(greenOverflow.hand.color.green).toBe(260);
  });

  it('外部のSet変更からクランプ履歴を保護する', () => {
    const channels = new Set<ColorChannel>([ColorChannel.Red]);
    const hand = new Hand(createHand(255, 255, 255).color, channels);
    channels.add(ColorChannel.Green);

    expect(hand.clampedChannels).toEqual(new Set([ColorChannel.Red]));
  });

  it('白に近い色ほど高い整数スコアにする', () => {
    const middle = scoring.calculate(createHand(100, 100, 100));
    const nearWhite = scoring.calculate(createHand(230, 230, 230));
    expect(Number.isInteger(middle)).toBe(true);
    expect(nearWhite).toBeGreaterThan(middle);
  });
});
