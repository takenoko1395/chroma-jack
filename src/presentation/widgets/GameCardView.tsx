import { Box, ButtonBase, Typography } from '@mui/material';
import type { GameCard } from '../../domain/models/card/GameCard';

type GameCardViewProps = {
  card: GameCard;
  label: string;
  actionLabel: string;
  onAccept: () => void;
};

// 公開候補のカードを、数値を見せずに選択できる表示へ変換する。
export function GameCardView({
  card,
  label,
  actionLabel,
  onAccept,
}: GameCardViewProps) {
  const { red, green, blue } = card.displayColor;
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <ButtonBase
        aria-label={actionLabel}
        onClick={onAccept}
        sx={{
          mt: 0.5,
          width: '100%',
          height: { xs: 112, sm: 160, md: 190 },
          bgcolor: `rgb(${red}, ${green}, ${blue})`,
          border: '1px solid rgba(0, 0, 0, 0.2)',
          borderRadius: 3,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.07)',
        }}
      />
    </Box>
  );
}
