// ゲームルールIDを生成できなかった理由を示す。
export enum GameRuleIdCreationFailure {
  // 識別子が空文字または空白だけである。
  Empty = 'empty',
}

// 空ではないゲームルール固有の識別子を保持するValue Object。
export class GameRuleId {
  // 検証済みの文字列を保持する。
  private constructor(readonly value: string) {}

  // 生の文字列を検証し、ルールIDまたは生成失敗理由を返す。
  static create(value: string): GameRuleId | GameRuleIdCreationFailure {
    if (value.trim().length === 0) return GameRuleIdCreationFailure.Empty;
    return new GameRuleId(value);
  }

  // 文字列値が等しいルールIDかどうかを返す。
  equals(other: GameRuleId): boolean {
    return this.value === other.value;
  }
}
