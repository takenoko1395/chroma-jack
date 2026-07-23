import { GameRound } from '../../models/game/GameRound';
import type { RoundNumber } from '../../models/game/RoundNumber';
import { Hand } from '../../models/hand/Hand';
import type { GameRules } from '../../models/rules/GameRules';
import type { RandomSource } from '../gateway/RandomSource';
import type { GameDeckFactory } from './GameDeckFactory';

// 初期Handと山札から新しいラウンド状態を組み立てるFactory。
export class GameRoundFactory {
  // 初期色と山札で同じ乱数列を共有する依存を保持する。
  constructor(
    private readonly randomSource: RandomSource,
    private readonly deckFactory: GameDeckFactory,
  ) {}

  // 指定ルールとラウンド番号から開始直後のラウンドを生成する。
  create(args: { rules: GameRules; roundNumber: RoundNumber }): GameRound {
    const hand = new Hand(this.createInitialColor(args.rules));
    const deck = this.deckFactory.create(args);
    return new GameRound({
      roundNumber: args.roundNumber,
      hand,
      offeredCards: deck.slice(0, args.rules.cardOfferSize.value),
      remainingDeck: deck.slice(args.rules.cardOfferSize.value),
    });
  }

  // 生成Policyと乱数供給源を使い、ルール範囲内の初期色を生成する。
  private createInitialColor(rules: GameRules) {
    const { initialColorRange, initialColorGenerationPolicy } = rules;
    return initialColorGenerationPolicy.generateColor(
      initialColorRange,
      this.randomSource,
    );
  }
}
