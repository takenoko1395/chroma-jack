import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { RoundResult } from '../../domain/models/game/Round';

type ScoreListProps = { results: readonly RoundResult[] };

// 最終結果画面でラウンドごとのスコアを一覧表示する。
export function ScoreList({ results }: ScoreListProps) {
  const { t, i18n } = useTranslation();
  return (
    <List disablePadding aria-label={t('finalResult.scoreList')}>
      {results.map((result) => (
        <ListItem
          key={result.roundNumber.value}
          disableGutters
          divider={result.roundNumber.value < results.length}
          sx={{ py: 1.5 }}
        >
          <ListItemText
            primary={t('finalResult.round', {
              number: result.roundNumber.value,
            })}
          />
          <Typography fontWeight={750}>
            {t('game.points', {
              value: result.score.value.toLocaleString(i18n.language),
            })}
          </Typography>
        </ListItem>
      ))}
    </List>
  );
}
