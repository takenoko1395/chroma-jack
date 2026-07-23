import { CardColorAmount } from '../../domain/models/card/CardColorAmount';
import { GameCard } from '../../domain/models/card/GameCard';
import { GameCardId } from '../../domain/models/card/GameCardId';
import { AddColorEffect } from '../../domain/models/card/effects/AddColorEffect';
import type { CardEffect } from '../../domain/models/card/effects/CardEffect';
import { SubtractColorEffect } from '../../domain/models/card/effects/SubtractColorEffect';
import { Color } from '../../domain/models/color/Color';
import { ColorAdjustment } from '../../domain/models/color/ColorAdjustment';
import { RoundNumber } from '../../domain/models/game/RoundNumber';
import { RoundScore } from '../../domain/models/game/RoundScore';
import { GameRuleId } from '../../domain/models/rules/GameRuleId';

// テスト入力から検証済みColorを生成する。
export function createColor(red: number, green: number, blue: number): Color {
  const color = Color.create(red, green, blue);
  if (!(color instanceof Color))
    throw new Error(`Invalid test color: ${color}`);
  return color;
}

// テスト入力から検証済みカード色変化量を生成する。
export function createCardColorAmount(
  red: number,
  green: number,
  blue: number,
): CardColorAmount {
  const amount = CardColorAmount.create(createColor(red, green, blue));
  if (!(amount instanceof CardColorAmount)) {
    throw new Error(`Invalid test card amount: ${amount}`);
  }
  return amount;
}

// テスト文字列から検証済みカードIDを生成する。
export function createGameCardId(value: string): GameCardId {
  const id = GameCardId.create(value);
  if (!(id instanceof GameCardId))
    throw new Error(`Invalid test card id: ${id}`);
  return id;
}

// テスト文字列から検証済みルールIDを生成する。
export function createGameRuleId(value: string): GameRuleId {
  const id = GameRuleId.create(value);
  if (!(id instanceof GameRuleId))
    throw new Error(`Invalid test rule id: ${id}`);
  return id;
}

// テスト入力から検証済みラウンド番号を生成する。
export function createRoundNumber(value: number): RoundNumber {
  const roundNumber = RoundNumber.create(value);
  if (!(roundNumber instanceof RoundNumber)) {
    throw new Error(`Invalid test round number: ${roundNumber}`);
  }
  return roundNumber;
}

// テスト入力から検証済みラウンド得点を生成する。
export function createRoundScore(value: number): RoundScore {
  const score = RoundScore.create(value);
  if (!(score instanceof RoundScore)) {
    throw new Error(`Invalid test round score: ${score}`);
  }
  return score;
}

// テスト入力から検証済みRGB差分を生成する。
export function createColorAdjustment(args: {
  red: number;
  green: number;
  blue: number;
}): ColorAdjustment {
  const adjustment = ColorAdjustment.create(args);
  if (!(adjustment instanceof ColorAdjustment)) {
    throw new Error(`Invalid test color adjustment: ${adjustment}`);
  }
  return adjustment;
}

// テスト用のRGB加算カードを生成する。
export function createAddColorCard(
  id: string,
  red: number,
  green: number,
  blue: number,
): GameCard {
  return new GameCard({
    id: createGameCardId(id),
    effect: new AddColorEffect(createCardColorAmount(red, green, blue)),
  });
}

// テスト用のRGB減算カードを生成する。
export function createSubtractColorCard(
  id: string,
  red: number,
  green: number,
  blue: number,
): GameCard {
  return new GameCard({
    id: createGameCardId(id),
    effect: new SubtractColorEffect(createCardColorAmount(red, green, blue)),
  });
}

// テスト用の任意Effectカードを生成する。
export function createEffectCard(id: string, effect: CardEffect): GameCard {
  return new GameCard({ id: createGameCardId(id), effect });
}
