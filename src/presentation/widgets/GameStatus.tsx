import { useEffect, useRef } from 'react';
import { Box, Stack, Typography } from '@mui/material';

type GameStatusProps = {
  currentRound: number;
  totalRounds: number;
  totalScore: number;
  cardsRemaining: number;
};

export function GameStatus({
  currentRound,
  totalRounds,
  totalScore,
  cardsRemaining,
}: GameStatusProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [currentRound]);

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      gap={2}
      sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Box>
        <Typography variant="overline" color="text.secondary">
          ラウンド
        </Typography>
        <Typography
          ref={headingRef}
          tabIndex={-1}
          variant="h5"
          component="h1"
          fontWeight={750}
        >
          {currentRound} / {totalRounds}
        </Typography>
      </Box>
      <Stack direction="row" spacing={{ xs: 2.5, sm: 5 }} textAlign="right">
        <Box>
          <Typography variant="overline" color="text.secondary">
            合計
          </Typography>
          <Typography fontWeight={700}>
            {totalScore.toLocaleString()}点
          </Typography>
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary">
            残り
          </Typography>
          <Typography fontWeight={700}>{cardsRemaining}枚</Typography>
        </Box>
      </Stack>
    </Stack>
  );
}
