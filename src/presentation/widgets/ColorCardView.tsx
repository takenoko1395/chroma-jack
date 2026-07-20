import { Box, ButtonBase, Typography } from '@mui/material';
import type { ColorCard } from '../../domain/models/hand/ColorCard';

type ColorCardViewProps = {
  card: ColorCard;
  label: string;
  selected: boolean;
  onSelect: () => void;
};

// 公開候補の色を、数値を見せずに選択できるカードとして表示する。
export function ColorCardView({
  card,
  label,
  selected,
  onSelect,
}: ColorCardViewProps) {
  const { red, green, blue } = card.color;
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <ButtonBase
        aria-label={label}
        aria-pressed={selected}
        onClick={onSelect}
        sx={{
          mt: 0.5,
          width: '100%',
          height: { xs: 112, sm: 160, md: 190 },
          bgcolor: `rgb(${red}, ${green}, ${blue})`,
          border: '3px solid',
          borderColor: selected ? 'primary.main' : 'rgba(0, 0, 0, 0.2)',
          borderRadius: 3,
          boxShadow: selected
            ? '0 0 0 3px rgba(37, 99, 235, 0.2)'
            : '0 12px 32px rgba(0, 0, 0, 0.07)',
        }}
      />
    </Box>
  );
}
