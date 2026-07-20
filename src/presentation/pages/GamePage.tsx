import { Box, Container, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { GameState } from '../../domain/models/game/Game';
import { ActionButtons } from '../widgets/ActionButtons';
import { CardOffer } from '../widgets/CardOffer';
import { ColorPanel } from '../widgets/ColorPanel';
import { GameStatus } from '../widgets/GameStatus';
import { RoundResult } from '../widgets/RoundResult';

type GamePageProps = {
  game: GameState;
  totalRounds: number;
  totalScore: number;
  onAccept: (cardId: string) => void;
  onDiscard: () => void;
  onStand: () => void;
  onContinue: () => void;
};

// 現在のラウンド状態、色面、操作またはラウンド結果を表示する。
export function GamePage({
  game,
  totalRounds,
  totalScore,
  onAccept,
  onDiscard,
  onStand,
  onContinue,
}: GamePageProps) {
  const { t } = useTranslation();
  const result = game.roundResults.at(-1);
  const cardsRemaining = game.remainingDeck.length + game.offeredCards.length;

  return (
    <Container maxWidth="lg" component="main" sx={{ py: { xs: 2.5, sm: 4 } }}>
      <GameStatus
        currentRound={game.currentRoundNumber}
        totalRounds={totalRounds}
        totalScore={totalScore}
        cardsRemaining={cardsRemaining}
      />
      <Stack sx={{ mt: 3 }}>
        {game.currentHand && <ColorPanel color={game.currentHand.color} />}
        {game.phase === 'playing' && game.offeredCards.length > 0 && (
          <CardOffer cards={game.offeredCards} onAccept={onAccept} />
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
          ? t('game.statusAnnouncement', {
              round: game.currentRoundNumber,
              cards: cardsRemaining,
            })
          : ''}
      </Typography>
      <Box>
        {game.phase === 'playing' && (
          <>
            {game.currentHand && game.currentHand.clampedChannels.size > 0 && (
              <Typography role="status" sx={{ mt: 2, textAlign: 'center' }}>
                {t('game.continuedBurst', {
                  count: game.currentHand.clampedChannels.size,
                })}
              </Typography>
            )}
            <ActionButtons onDiscard={onDiscard} onStand={onStand} />
          </>
        )}
        {game.phase === 'roundFinished' && result && (
          <RoundResult
            result={result}
            isLastRound={game.currentRoundNumber === totalRounds}
            onContinue={onContinue}
          />
        )}
      </Box>
    </Container>
  );
}
