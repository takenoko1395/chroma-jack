// カードIDを生成できなかった理由を示す。
export enum GameCardIdCreationFailure {
  // 識別子が空文字または空白だけである。
  Empty = 'empty',
}

// 空ではないカード固有の識別子を保持するValue Object。
export class GameCardId {
  // 検証済みの文字列を保持する。
  private constructor(readonly value: string) {}

  // 生の文字列を検証し、カードIDまたは生成失敗理由を返す。
  static create(value: string): GameCardId | GameCardIdCreationFailure {
    if (value.trim().length === 0) return GameCardIdCreationFailure.Empty;
    return new GameCardId(value);
  }

  // 文字列値が等しいカードIDかどうかを返す。
  equals(other: GameCardId): boolean {
    return this.value === other.value;
  }
}
