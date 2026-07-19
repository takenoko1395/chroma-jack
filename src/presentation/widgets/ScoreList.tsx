import { List, ListItem, ListItemText, Typography } from '@mui/material';
import type { RoundResult } from '../../domain/models/game/Round';

type ScoreListProps = { results: readonly RoundResult[] };

export function ScoreList({ results }: ScoreListProps) {
  return (
    <List disablePadding aria-label="各ラウンドのスコア">
      {results.map((result) => (
        <ListItem
          key={result.roundNumber}
          disableGutters
          divider={result.roundNumber < results.length}
          sx={{ py: 1.5 }}
        >
          <ListItemText primary={`ラウンド ${result.roundNumber}`} />
          <Typography fontWeight={750}>
            {result.score.toLocaleString()}点
          </Typography>
        </ListItem>
      ))}
    </List>
  );
}
