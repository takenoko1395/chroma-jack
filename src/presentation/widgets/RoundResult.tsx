import { Box, Button, Typography } from '@mui/material';
import type { RoundResult as RoundResultModel } from '../../domain/models/game/Round';
import { ColorValueSummary } from './ColorValueSummary';

type RoundResultProps = {
  result: RoundResultModel;
  isLastRound: boolean;
  onContinue: () => void;
};

// 終了理由、得点、確定色またはバースト後の値を表示する。
export function RoundResult({
  result,
  isLastRound,
  onContinue,
}: RoundResultProps) {
  const didBurst = result.endReason === 'burst';
  const resultColor = didBurst
    ? result.burstHand.color
    : result.finalHand.color;
  const endMessage =
    result.endReason === 'deckExhausted'
      ? '山札を使い切りました'
      : 'ここで色を確定しました';
  return (
    <Box
      aria-live="polite"
      sx={{
        mt: 3,
        p: { xs: 2.5, sm: 3 },
        bgcolor: 'background.paper',
        borderRadius: 3,
      }}
    >
      <Typography variant="overline" color="text.secondary">
        ラウンド終了
      </Typography>
      <Typography variant="h4" component="h2" sx={{ mt: 0.5 }}>
        {didBurst ? 'バースト' : `${result.score.toLocaleString()}点`}
      </Typography>
      {!didBurst && (
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {endMessage}
        </Typography>
      )}
      {didBurst && (
        <>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            白を通り越してしまいました
          </Typography>
          <Typography variant="h6" sx={{ mt: 1.5 }}>
            0点
          </Typography>
        </>
      )}
      <ColorValueSummary
        color={resultColor}
        label={didBurst ? '加算後の色（バーストした値）' : '確定した色'}
      />
      <Button
        variant="contained"
        size="large"
        onClick={onContinue}
        sx={{ mt: 3 }}
      >
        {isLastRound ? '結果を見る' : '次のラウンドへ'}
      </Button>
    </Box>
  );
}
