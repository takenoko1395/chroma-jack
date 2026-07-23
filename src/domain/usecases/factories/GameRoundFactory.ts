import { GameRound } from '../../models/game/GameRound';
import type { RoundNumber } from '../../models/game/RoundNumber';
import { Hand } from '../../models/hand/Hand';
import type { GameRules } from '../../models/rules/GameRules';
import type { GameDeckFactory } from './GameDeckFactory';

// 初期Handと山札から新しいラウンド状態を組み立てるFactory。
export class GameRoundFactory {
  // 山札生成を委譲するFactoryを保持する。
  constructor(private readonly deckFactory: GameDeckFactory) {}

  // 指定ルールとラウンド番号から開始直後のラウンドを生成する。
  create(args: { rules: GameRules; roundNumber: RoundNumber }): GameRound {
    const hand = new Hand(args.rules.initialColor);
    const deck = this.deckFactory.create(args);
    return new GameRound({
      roundNumber: args.roundNumber,
      hand,
      offeredCards: deck.slice(0, args.rules.cardOfferSize.value),
      remainingDeck: deck.slice(args.rules.cardOfferSize.value),
    });
  }
}
