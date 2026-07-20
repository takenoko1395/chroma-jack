import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Color } from '../../domain/models/color/Color';
import { ColorChannel } from '../../domain/models/color/ColorChannel';
import type { GameState } from '../../domain/models/game/Game';
import { ColorCard } from '../../domain/models/hand/ColorCard';
import { Hand } from '../../domain/models/hand/Hand';
import { AppProviders } from '../providers/AppProviders';
import { GamePage } from './GamePage';

// 継続可能なバースト後のプレイ状態を生成する。
function createContinuedGame(): GameState {
  const color = Color.create(255, 100, 100);
  const card = ColorCard.create('next', 1, 1, 1);
  if (!(color instanceof Color) || !(card instanceof ColorCard)) {
    throw new RangeError('Invalid test game values.');
  }
  return {
    phase: 'playing',
    currentRoundNumber: 1,
    currentHand: new Hand(color, new Set([ColorChannel.Red])),
    currentCard: card,
    remainingDeck: [],
    roundResults: [],
  };
}

describe('GamePage', () => {
  it('継続可能なバースト後に累計バースト色数を表示する', () => {
    render(
      <AppProviders>
        <GamePage
          game={createContinuedGame()}
          totalRounds={5}
          totalScore={0}
          onAccept={vi.fn()}
          onDiscard={vi.fn()}
          onStand={vi.fn()}
          onContinue={vi.fn()}
        />
      </AppProviders>,
    );

    expect(
      screen.getByText('1色バースト・上限の色で続行します'),
    ).toBeInTheDocument();
  });
});
