import { Box, Typography } from '@mui/material';
import type { ColorCard } from '../../domain/models/hand/ColorCard';

type ColorCardViewProps = {
  card: ColorCard;
};

export function ColorCardView({ card }: ColorCardViewProps) {
  const { red, green, blue } = card.color;
  return (
    <Box sx={{ width: { xs: '100%', md: 240 }, flexShrink: 0 }}>
      <Typography
        component="h2"
        variant="overline"
        sx={{ color: 'text.secondary', letterSpacing: '0.14em' }}
      >
        次の色
      </Typography>
      <Box
        role="img"
        aria-label="次に引いた色"
        sx={{
          mt: 0.5,
          width: '100%',
          height: { xs: 96, sm: 148, md: 240 },
          bgcolor: `rgb(${red}, ${green}, ${blue})`,
          border: '1px solid rgba(0, 0, 0, 0.2)',
          borderRadius: 3,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.07)',
        }}
      />
    </Box>
  );
}
