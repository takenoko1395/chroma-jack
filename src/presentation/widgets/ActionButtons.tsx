import { Button, Stack } from '@mui/material';

type ActionButtonsProps = {
  onAccept: () => void;
  onDiscard: () => void;
  onStand: () => void;
};

// 公開カードに対する加算・破棄・停止操作をまとめて表示する。
export function ActionButtons({
  onAccept,
  onDiscard,
  onStand,
}: ActionButtonsProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
      <Button
        variant="contained"
        size="large"
        onClick={onAccept}
        sx={{ flex: 1 }}
      >
        加える
      </Button>
      <Button
        variant="outlined"
        size="large"
        onClick={onDiscard}
        sx={{ flex: 1 }}
      >
        捨てる
      </Button>
      <Button variant="text" size="large" onClick={onStand} sx={{ flex: 1 }}>
        ここで止める
      </Button>
    </Stack>
  );
}
