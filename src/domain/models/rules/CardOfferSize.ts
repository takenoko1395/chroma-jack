// 同時公開枚数を生成できなかった理由を示す。
export enum CardOfferSizeCreationFailure {
  // 枚数が正の安全な整数ではない。
  NotPositiveInteger = 'notPositiveInteger',
}

// 1回に公開するカード枚数を保持するValue Object。
export class CardOfferSize {
  // 検証済みの枚数を保持する。
  private constructor(readonly value: number) {}

  // 生の数値を検証し、公開枚数または生成失敗理由を返す。
  static create(value: number): CardOfferSize | CardOfferSizeCreationFailure {
    if (!Number.isSafeInteger(value) || value <= 0) {
      return CardOfferSizeCreationFailure.NotPositiveInteger;
    }
    return new CardOfferSize(value);
  }
}
