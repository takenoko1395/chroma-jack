import { Color } from '../color/Color';
import type { ColorCard } from './ColorCard';

export enum HandAdditionStatus {
  Added = 'added',
  Burst = 'burst',
}

export type HandAddition = Readonly<{
  status: HandAdditionStatus;
  hand: Hand;
}>;

export class Hand {
  static readonly BURST_CHANNEL_LIMIT = 255;
  static readonly MAXIMUM_SCORE = 1000;

  constructor(readonly color: Color) {}

  add(card: ColorCard): HandAddition {
    const hand = new Hand(this.color.add(card.color));
    return {
      status: hand.isBurst()
        ? HandAdditionStatus.Burst
        : HandAdditionStatus.Added,
      hand,
    };
  }

  isBurst(): boolean {
    return (
      this.color.red > Hand.BURST_CHANNEL_LIMIT ||
      this.color.green > Hand.BURST_CHANNEL_LIMIT ||
      this.color.blue > Hand.BURST_CHANNEL_LIMIT
    );
  }

  calculateScore(): number {
    if (this.isBurst()) return 0;

    const maximumDistance = Math.sqrt(3 * Hand.BURST_CHANNEL_LIMIT ** 2);
    const distance = Math.sqrt(
      (Hand.BURST_CHANNEL_LIMIT - this.color.red) ** 2 +
        (Hand.BURST_CHANNEL_LIMIT - this.color.green) ** 2 +
        (Hand.BURST_CHANNEL_LIMIT - this.color.blue) ** 2,
    );
    const score = Math.round(
      (1 - distance / maximumDistance) * Hand.MAXIMUM_SCORE,
    );
    return Math.max(0, Math.min(Hand.MAXIMUM_SCORE, score));
  }
}
