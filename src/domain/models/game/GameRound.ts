import type { GameCard } from '../card/GameCard';
import type { Hand } from '../hand/Hand';
import { HandAdditionStatus } from '../hand/Hand';
import type { OverflowPolicy } from '../rules/OverflowPolicy';

// GameRoundへカードまたは破棄操作を適用した後の進行状態を示す。
export enum GameRoundActionStatus {
  // 操作を反映し、次の候補でラウンドを継続する。
  Continued = 'continued',
  // 操作後に山札と候補を使い切り、ラウンドを終了する。
  DeckExhausted = 'deckExhausted',
  // カード効果で許容数を超えてバーストし、ラウンドを終了する。
  Burst = 'burst',
  // 指定されたカードが現在の候補に存在せず、状態を変更しない。
  CardNotOffered = 'cardNotOffered',
}

// GameRoundの操作結果と、バースト時の加算後Handを保持する。
export type GameRoundAction = Readonly<{
  status: GameRoundActionStatus;
  round: GameRound;
  burstHand: Hand | null;
}>;

// 現在のHand、公開候補、山札を所有し、1ラウンド内のカード進行を実行する。
export class GameRound {
  readonly roundNumber: number;
  readonly hand: Hand;
  readonly offeredCards: readonly GameCard[];
  readonly remainingDeck: readonly GameCard[];

  // ある時点のラウンド進行に必要な状態を保持する。
  constructor(args: {
    roundNumber: number;
    hand: Hand;
    offeredCards: readonly GameCard[];
    remainingDeck: readonly GameCard[];
  }) {
    this.roundNumber = args.roundNumber;
    this.hand = args.hand;
    this.offeredCards = args.offeredCards;
    this.remainingDeck = args.remainingDeck;
  }

  // 公開候補のカード効果をHandへ適用し、未選択候補を破棄して次へ進める。
  playCard(args: {
    cardId: string;
    overflowPolicy: OverflowPolicy;
    cardOfferSize: number;
  }): GameRoundAction {
    const selectedCard = this.offeredCards.find(
      (card) => card.id === args.cardId,
    );
    if (selectedCard === undefined) {
      return {
        status: GameRoundActionStatus.CardNotOffered,
        round: this,
        burstHand: null,
      };
    }

    // 手札にカードを加えた時の挙動は hand と overflowPolicy に委譲する。
    const addition = selectedCard.applyTo(this.hand, args.overflowPolicy);
    if (addition.status === HandAdditionStatus.Burst) {
      return {
        status: GameRoundActionStatus.Burst,
        round: new GameRound({
          roundNumber: this.roundNumber,
          hand: this.hand,
          offeredCards: [],
          remainingDeck: this.remainingDeck,
        }),
        burstHand: addition.hand,
      };
    }
    return this.advanceOffer(addition.hand, args.cardOfferSize);
  }

  // 現在の公開候補をすべて破棄し、Handを変えずに次へ進める。
  discardOffer(cardOfferSize: number): GameRoundAction {
    return this.advanceOffer(this.hand, cardOfferSize);
  }

  // 指定したHandを保持して次候補を公開し、山札が空なら終了を返す。
  private advanceOffer(hand: Hand, cardOfferSize: number): GameRoundAction {
    if (this.remainingDeck.length === 0) {
      return {
        status: GameRoundActionStatus.DeckExhausted,
        round: new GameRound({
          roundNumber: this.roundNumber,
          hand,
          offeredCards: [],
          remainingDeck: [],
        }),
        burstHand: null,
      };
    }
    return {
      status: GameRoundActionStatus.Continued,
      round: new GameRound({
        roundNumber: this.roundNumber,
        hand,
        offeredCards: this.remainingDeck.slice(0, cardOfferSize),
        remainingDeck: this.remainingDeck.slice(cardOfferSize),
      }),
      burstHand: null,
    };
  }
}
