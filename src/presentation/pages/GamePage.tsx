import { Box, Container, Stack, Typography } from '@mui/material';
import type { GameState } from '../../domain/models/game/Game';
import { ActionButtons } from '../widgets/ActionButtons';
import { ColorCardView } from '../widgets/ColorCardView';
import { ColorPanel } from '../widgets/ColorPanel';
import { GameStatus } from '../widgets/GameStatus';
import { RoundResult } from '../widgets/RoundResult';

type GamePageProps = {
  game: GameState;
  totalScore: number;
  onAccept: () => void;
  onDiscard: () => void;
  onStand: () => void;
  onContinue: () => void;
};

export function GamePage({
  game,
  totalScore,
  onAccept,
  onDiscard,
  onStand,
  onContinue,
}: GamePageProps) {
  const result = game.roundResults.at(-1);

  return (
    <Container maxWidth="lg" component="main" sx={{ py: { xs: 2.5, sm: 4 } }}>
      <GameStatus
        currentRound={game.currentRoundNumber}
        totalRounds={game.totalRounds}
        totalScore={totalScore}
        cardsRemaining={game.remainingDeck.length + (game.currentCard ? 1 : 0)}
      />
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        gap={{ xs: 2, md: 4 }}
        sx={{ mt: 3 }}
      >
        {game.currentHand && <ColorPanel color={game.currentHand.color} />}
        {game.phase === 'playing' && game.currentCard && (
          <ColorCardView card={game.currentCard} />
        )}
      </Stack>
      <Typography
        role="status"
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
        }}
      >
        {game.phase === 'playing'
          ? `現在の色と次の色を確認してください。ラウンド${game.currentRoundNumber}、残り${game.remainingDeck.length + (game.currentCard ? 1 : 0)}枚です`
          : ''}
      </Typography>
      <Box sx={{ maxWidth: { md: 'calc(100% - 272px)' } }}>
        {game.phase === 'playing' && (
          <ActionButtons
            onAccept={onAccept}
            onDiscard={onDiscard}
            onStand={onStand}
          />
        )}
        {game.phase === 'roundFinished' && result && (
          <RoundResult
            result={result}
            isLastRound={game.currentRoundNumber === game.totalRounds}
            onContinue={onContinue}
          />
        )}
      </Box>
    </Container>
  );
}
