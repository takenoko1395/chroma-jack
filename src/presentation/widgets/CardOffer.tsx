import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ColorCard } from '../../domain/models/hand/ColorCard';
import { ColorCardView } from './ColorCardView';

type CardOfferProps = {
  cards: readonly ColorCard[];
  onAccept: (cardId: string) => void;
};

// 山札から同時に公開された候補色を、選択可能な一覧として表示する。
export function CardOffer({ cards, onAccept }: CardOfferProps) {
  const { t } = useTranslation();
  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        component="h2"
        variant="overline"
        sx={{ color: 'text.secondary', letterSpacing: '0.14em' }}
      >
        {t('game.offeredColors')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('game.offerInstruction')}
      </Typography>
      <Box
        sx={{
          mt: 0.5,
          display: 'grid',
          gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))`,
          gap: { xs: 1, sm: 2 },
        }}
      >
        {cards.map((card, index) => (
          <ColorCardView
            key={card.id}
            card={card}
            label={t('game.offeredColor', { number: index + 1 })}
            actionLabel={t('game.acceptOfferedColor', { number: index + 1 })}
            onAccept={() => onAccept(card.id)}
          />
        ))}
      </Box>
    </Box>
  );
}
