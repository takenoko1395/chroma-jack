import { useState } from 'react';
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
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const activeSelectedCardId = game.offeredCards.some(
    (card) => card.id === selectedCardId,
  )
    ? selectedCardId
    : game.offeredCards.length === 1
      ? (game.offeredCards[0]?.id ?? null)
      : null;
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
          <CardOffer
            cards={game.offeredCards}
            selectedCardId={activeSelectedCardId}
            onSelect={setSelectedCardId}
          />
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
            <ActionButtons
              onAccept={() => {
                if (activeSelectedCardId !== null) {
                  onAccept(activeSelectedCardId);
                }
              }}
              onDiscard={onDiscard}
              onStand={onStand}
              canAccept={activeSelectedCardId !== null}
            />
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
