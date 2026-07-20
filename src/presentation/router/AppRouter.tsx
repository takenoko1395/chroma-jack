import { useMemo, useState } from 'react';
import { GamePage } from '../pages/GamePage';
import { ResultPage } from '../pages/ResultPage';
import { TitlePage } from '../pages/TitlePage';
import { useChromaJack } from '../providers/useChromaJack';
import { GameRules } from '../../domain/models/rules/GameRules';

const CLASSIC_RULES = GameRules.classic();
const CLAMP_CHALLENGE_RULES = GameRules.clampChallenge();

type AppRouterProps = {
  initialRules?: GameRules;
};

// ゲーム状態に応じてタイトル・プレイ・最終結果画面を切り替える。
export function AppRouter({ initialRules = CLASSIC_RULES }: AppRouterProps) {
  const ruleOptions = useMemo(() => {
    const options = new Map(
      [CLASSIC_RULES, CLAMP_CHALLENGE_RULES, initialRules].map((option) => [
        option.id,
        option,
      ]),
    );
    return [...options.values()];
  }, [initialRules]);
  const [selectedRulesId, setSelectedRulesId] = useState(initialRules.id);
  const selectedRules =
    ruleOptions.find((option) => option.id === selectedRulesId) ?? initialRules;
  const {
    game,
    totalRounds,
    totalScore,
    maximumScore,
    beginGame,
    acceptCard,
    discardCard,
    standRound,
    advanceRound,
    goToTitle,
  } = useChromaJack(selectedRules);

  if (game.phase === 'notStarted') {
    return (
      <TitlePage
        ruleOptions={ruleOptions}
        selectedRulesId={selectedRules.id}
        onSelectRules={setSelectedRulesId}
        onStart={beginGame}
      />
    );
  }
  if (game.phase === 'gameFinished') {
    return (
      <ResultPage
        totalScore={totalScore}
        totalRounds={totalRounds}
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
      totalRounds={totalRounds}
      totalScore={totalScore}
      onAccept={acceptCard}
      onDiscard={discardCard}
      onStand={standRound}
      onContinue={advanceRound}
    />
  );
}
