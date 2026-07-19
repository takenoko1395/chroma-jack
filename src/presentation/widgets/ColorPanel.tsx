import { Box, Typography } from '@mui/material';
import type { Color } from '../../domain/models/color/Color';

type ColorPanelProps = {
  color: Color;
};

function toCssColor(color: Color): string {
  return `rgb(${color.red}, ${color.green}, ${color.blue})`;
}

export function ColorPanel({ color }: ColorPanelProps) {
  return (
    <Box sx={{ flex: 1.65, minWidth: 0 }}>
      <Typography
        component="h2"
        variant="overline"
        sx={{ color: 'text.secondary', letterSpacing: '0.14em' }}
      >
        現在の色
      </Typography>
      <Box
        role="img"
        aria-label="現在の色"
        sx={{
          mt: 0.5,
          width: '100%',
          height: { xs: 180, sm: 300, md: 360 },
          bgcolor: toCssColor(color),
          border: '1px solid rgba(0, 0, 0, 0.2)',
          borderRadius: 3,
          boxShadow: '0 18px 50px rgba(0, 0, 0, 0.08)',
          transition: 'background-color 320ms ease',
        }}
      />
    </Box>
  );
}
