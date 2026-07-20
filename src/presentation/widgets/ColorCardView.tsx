import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ColorCard } from '../../domain/models/hand/ColorCard';

type ColorCardViewProps = {
  card: ColorCard;
};

// 現在公開されている色カードを数値なしの色面として表示する。
export function ColorCardView({ card }: ColorCardViewProps) {
  const { t } = useTranslation();
  const { red, green, blue } = card.color;
  return (
    <Box sx={{ flex: 1, minWidth: 0, maxWidth: 320 }}>
      <Typography
        component="h2"
        variant="overline"
        sx={{ color: 'text.secondary', letterSpacing: '0.14em' }}
      >
        {t('game.nextColor')}
      </Typography>
      <Box
        role="img"
        aria-label={t('game.nextDrawnColor')}
        sx={{
          mt: 0.5,
          width: '100%',
          height: { xs: 140, sm: 240, md: 280 },
          bgcolor: `rgb(${red}, ${green}, ${blue})`,
          border: '1px solid rgba(0, 0, 0, 0.2)',
          borderRadius: 3,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.07)',
        }}
      />
    </Box>
  );
}
