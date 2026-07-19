import { Box, Stack, Typography } from '@mui/material';
import type { Color } from '../../domain/models/color/Color';

type ColorValueSummaryProps = {
  color: Color;
  label: string;
};

const CHANNELS = [
  { name: 'R', select: (color: Color) => color.red },
  { name: 'G', select: (color: Color) => color.green },
  { name: 'B', select: (color: Color) => color.blue },
] as const;

export function ColorValueSummary({ color, label }: ColorValueSummaryProps) {
  return (
    <Box sx={{ mt: 2.5 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        aria-label={`${label}の数値`}
        sx={{ mt: 0.75 }}
      >
        {CHANNELS.map((channel) => (
          <Box
            key={channel.name}
            sx={{
              flex: 1,
              minWidth: 0,
              px: { xs: 1, sm: 1.5 },
              py: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.default',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {channel.name}
            </Typography>
            <Typography fontWeight={750}>{channel.select(color)}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
