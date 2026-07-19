import { useEffect, useRef } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';

type TitlePageProps = { onStart: () => void };

// ゲーム概要と開始操作を提示するタイトル画面。
export function TitlePage({ onStart }: TitlePageProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

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
          component="p"
          sx={{
            mt: 3,
            maxWidth: 500,
            fontSize: { xs: 18, sm: 21 },
            lineHeight: 1.9,
          }}
        >
          色を重ねて、白に近づけよう。
          <br />
          ただし、加えすぎるとバースト。
          <br />
          数字ではなく、色だけを信じてください。
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={onStart}
          sx={{ mt: 5, minWidth: 210 }}
        >
          ゲームを始める
        </Button>
      </Stack>
    </Container>
  );
}
