import { useCallback, useRef, useState } from 'react';
import type { GameState } from '../../domain/models/game/Game';
import { GameScore } from '../../domain/models/game/GameScore';
import {
  acceptCurrentCard,
  discardCurrentCard,
  INITIAL_GAME_STATE,
  returnToTitle,
  standCurrentRound,
  startGame,
  startNextRound,
} from '../../domain/usecases/gameActions';
import { BrowserRandomGenerator } from '../../gateway/repositories/BrowserRandomGenerator';

export function useChromaJack() {
  const random = useRef(new BrowserRandomGenerator());
  const [game, setGame] = useState<GameState>(INITIAL_GAME_STATE);

  const beginGame = useCallback(() => setGame(startGame(random.current)), []);
  const acceptCard = useCallback(
    () => setGame((current) => acceptCurrentCard(current)),
    [],
  );
  const discardCard = useCallback(
    () => setGame((current) => discardCurrentCard(current)),
    [],
  );
  const standRound = useCallback(
    () => setGame((current) => standCurrentRound(current)),
    [],
  );
  const advanceRound = useCallback(
    () => setGame((current) => startNextRound(current, random.current)),
    [],
  );
  const goToTitle = useCallback(() => setGame(returnToTitle()), []);

  return {
    game,
    totalScore: GameScore.calculate(game.roundResults).value,
    beginGame,
    acceptCard,
    discardCard,
    standRound,
    advanceRound,
    goToTitle,
  };
}
