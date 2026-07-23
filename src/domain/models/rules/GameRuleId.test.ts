import { describe, expect, it } from 'vitest';
import { GameRuleId, GameRuleIdCreationFailure } from './GameRuleId';

describe('GameRuleId', () => {
  it('空ではないルールIDを保持する', () => {
    const id = GameRuleId.create('classic');

    expect(id).toBeInstanceOf(GameRuleId);
    if (!(id instanceof GameRuleId)) return;
    expect(id.value).toBe('classic');
  });

  it('空白だけのルールIDを拒否する', () => {
    expect(GameRuleId.create('  ')).toBe(GameRuleIdCreationFailure.Empty);
  });
});
