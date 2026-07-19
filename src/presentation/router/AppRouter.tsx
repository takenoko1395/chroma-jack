import { GamePage } from '../pages/GamePage';
import { ResultPage } from '../pages/ResultPage';
import { TitlePage } from '../pages/TitlePage';
import { useChromaJack } from '../providers/useChromaJack';
import { GAME_CONFIG } from '../../domain/models/game/gameConfig';

export function AppRouter() {
  const {
    game,
    totalScore,
    beginGame,
    acceptCard,
    discardCard,
    standRound,
    advanceRound,
    goToTitle,
  } = useChromaJack();

  if (game.phase === 'notStarted') return <TitlePage onStart={beginGame} />;
  if (game.phase === 'gameFinished') {
    return (
      <ResultPage
        totalScore={totalScore}
        totalRounds={game.totalRounds}
        maximumScore={game.totalRounds * GAME_CONFIG.maxRoundScore}
        results={game.roundResults}
        onReplay={beginGame}
        onTitle={goToTitle}
      />
    );
  }
  return (
    <GamePage
      game={game}
      totalScore={totalScore}
      onAccept={acceptCard}
      onDiscard={discardCard}
      onStand={standRound}
      onContinue={advanceRound}
    />
  );
}
