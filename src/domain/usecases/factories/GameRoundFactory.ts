import { Color } from '../../models/color/Color';
import { GameRound } from '../../models/game/GameRound';
import { Hand } from '../../models/hand/Hand';
import type { GameRules } from '../../models/rules/GameRules';
import type { RandomSource } from '../../usecases/gateway/RandomSource';
import type { GameDeckFactory } from './GameDeckFactory';

// 初期Handと山札から新しいラウンド状態を組み立てるFactory。
export class GameRoundFactory {
  // 初期色と山札で同じ乱数列を共有する依存を保持する。
  constructor(
    private readonly randomSource: RandomSource,
    private readonly deckFactory: GameDeckFactory,
  ) { }

  // 指定ルールとラウンド番号から開始直後のラウンドを生成する。
  create(args: { rules: GameRules; roundNumber: number }): GameRound {
    const hand = new Hand(this.createInitialColor(args.rules));
    const deck = this.deckFactory.create(args);
    return new GameRound({
      roundNumber: args.roundNumber,
      hand,
      offeredCards: deck.slice(0, args.rules.cardOfferSize),
      remainingDeck: deck.slice(args.rules.cardOfferSize),
    });
  }

  // 生成Policyと乱数供給源を使い、ルール範囲内の初期色を生成する。
  private createInitialColor(rules: GameRules): Color {
    const { initialColorRange, initialColorGenerationPolicy } = rules;
    const color = Color.create(
      initialColorGenerationPolicy.generateChannel(
        initialColorRange,
        this.randomSource,
      ),
      initialColorGenerationPolicy.generateChannel(
        initialColorRange,
        this.randomSource,
      ),
      initialColorGenerationPolicy.generateChannel(
        initialColorRange,
        this.randomSource,
      ),
    );
    if (!(color instanceof Color)) {
      throw new RangeError(`Random source returned an invalid color: ${color}`);
    }
    return color;
  }
}
