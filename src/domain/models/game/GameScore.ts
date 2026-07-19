import type { RoundResult } from './Round';

export class GameScore {
  private constructor(readonly value: number) {}

  static calculate(roundResults: readonly RoundResult[]): GameScore {
    return new GameScore(
      roundResults.reduce((total, result) => total + result.score, 0),
    );
  }
}
