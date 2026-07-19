import { GamePage } from '../pages/GamePage';
import { ResultPage } from '../pages/ResultPage';
import { TitlePage } from '../pages/TitlePage';
import { useChromaJack } from '../providers/useChromaJack';
import { GameRules } from '../../domain/models/rules/GameRules';

const DEFAULT_RULES = GameRules.clampChallenge();

type AppRouterProps = {
  rules?: GameRules;
};

// ゲーム状態に応じてタイトル・プレイ・最終結果画面を切り替える。
export function AppRouter({ rules = DEFAULT_RULES }: AppRouterProps) {
  const {
    game,
    totalScore,
    maximumScore,
    beginGame,
    acceptCard,
    discardCard,
    standRound,
    advanceRound,
    goToTitle,
  } = useChromaJack(rules);

  if (game.phase === 'notStarted') return <TitlePage onStart={beginGame} />;
  if (game.phase === 'gameFinished') {
    return (
      <ResultPage
        totalScore={totalScore}
        totalRounds={game.totalRounds}
        maximumScore={maximumScore}
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
