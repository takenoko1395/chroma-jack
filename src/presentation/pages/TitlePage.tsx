import { useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { GameRules } from '../../domain/models/rules/GameRules';

type TitlePageProps = {
  ruleOptions: readonly GameRules[];
  selectedRulesId: string;
  onSelectRules: (rulesId: string) => void;
  onStart: () => void;
};

// プリセットの識別子をコンボボックス用の表示名へ変換する。
function getRulesLabel(rules: GameRules): string {
  if (rules.id === 'classic') return 'Classic';
  if (rules.id === 'clamp-challenge') return 'Clamp Challenge';
  return rules.id;
}

// ゲーム概要と開始操作を提示するタイトル画面。
export function TitlePage({
  ruleOptions,
  selectedRulesId,
  onSelectRules,
  onStart,
}: TitlePageProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const selectedRules =
    ruleOptions.find((rules) => rules.id === selectedRulesId) ?? ruleOptions[0];

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <Container maxWidth="md">
      <Stack
        component="main"
        minHeight="100dvh"
        justifyContent="center"
        alignItems="flex-start"
        sx={{ py: 6 }}
      >
        <Box
          aria-hidden="true"
          sx={{
            width: { xs: 72, sm: 92 },
            aspectRatio: '1',
            mb: 4,
            borderRadius: '50%',
            background:
              'conic-gradient(from 30deg, #ff5e5b, #ffd166, #54c487, #38a3db, #7768d8, #ff5e5b)',
            border: '1px solid rgba(0,0,0,.15)',
          }}
        />
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: '0.2em', mb: 1 }}
        >
          Trust your eyes
        </Typography>
        <Typography
          ref={headingRef}
          tabIndex={-1}
          component="h1"
          variant="h1"
          sx={{ fontSize: { xs: 56, sm: 86 } }}
        >
          Chroma Jack
        </Typography>
        <Typography
          id="game-rules-description"
          component="p"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          sx={{
            mt: 3,
            maxWidth: 500,
            fontSize: { xs: 18, sm: 21 },
            lineHeight: 1.9,
          }}
        >
          色を重ねて、白に近づけよう。
          <br />
          {selectedRules?.overflowPolicy.allowedBurstColors === 0
            ? 'ただし、加えすぎるとバースト。'
            : `${selectedRules?.overflowPolicy.allowedBurstColors ?? 0}色までバーストしても上限で止まり、次の色のバーストでラウンド終了。`}
          {selectedRules?.id === 'clamp-challenge' && (
            <>
              <br />
              初期色とカードは明るめに出やすく、バーストした色があると得点上限が下がります。
            </>
          )}
          <br />
          数字ではなく、色だけを信じてください。
        </Typography>
        <FormControl sx={{ mt: 4, minWidth: { xs: '100%', sm: 280 } }}>
          <InputLabel id="game-rules-label">ゲームルール</InputLabel>
          <Select
            labelId="game-rules-label"
            value={selectedRulesId}
            label="ゲームルール"
            inputProps={{ 'aria-describedby': 'game-rules-description' }}
            onChange={(event: SelectChangeEvent) =>
              onSelectRules(event.target.value)
            }
          >
            {ruleOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {getRulesLabel(option)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          size="large"
          onClick={onStart}
          sx={{ mt: 3, minWidth: 210 }}
        >
          ゲームを始める
        </Button>
      </Stack>
    </Container>
  );
}
