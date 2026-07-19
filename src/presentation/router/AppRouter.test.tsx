import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '../providers/AppProviders';
import { AppRouter } from './AppRouter';

function renderApp() {
  return render(
    <AppProviders>
      <AppRouter />
    </AppProviders>,
  );
}

describe('App', () => {
  it('開始画面からゲームを始め、色面と3操作を表示する', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: 'ゲームを始める' }));

    expect(screen.getByLabelText('現在の色')).toBeInTheDocument();
    expect(screen.getByLabelText('次に引いた色')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '加える' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '捨てる' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ここで止める' }),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/#[0-9a-f]{6}/i);
    expect(document.body.textContent).not.toMatch(/RGB\s*\(/i);
    expect(screen.queryByLabelText(/色の数値/)).not.toBeInTheDocument();
  });

  it('途中で止めた場合は未使用カードの残数を保つ', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: 'ゲームを始める' }));
    await user.click(screen.getByRole('button', { name: 'ここで止める' }));

    expect(screen.getByText('12枚')).toBeInTheDocument();
    expect(screen.getByText('ラウンド終了')).toBeInTheDocument();
    expect(screen.getByLabelText('確定した色の数値')).toBeInTheDocument();
  });

  it('5ラウンドを終えて結果を表示し、もう一度遊べる', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: 'ゲームを始める' }));

    for (let round = 1; round <= 5; round += 1) {
      await user.click(screen.getByRole('button', { name: 'ここで止める' }));
      const nextLabel = round === 5 ? '結果を見る' : '次のラウンドへ';
      await user.click(screen.getByRole('button', { name: nextLabel }));
    }

    expect(
      screen.getByRole('heading', { name: 'ゲーム終了' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('各ラウンドのスコア').children).toHaveLength(
      5,
    );
    await user.click(screen.getByRole('button', { name: 'もう一度遊ぶ' }));
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
  });
});
