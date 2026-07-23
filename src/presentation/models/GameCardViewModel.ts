import type { GameCardId } from '../../domain/models/card/GameCardId';

// カードのDomain情報をUIがそのまま描画できる形へ変換した表示モデル。
export type GameCardViewModel = Readonly<{
  id: GameCardId;
  titleKey: string;
  titleValues?: Readonly<Record<string, string | number>>;
  backgroundColor: string;
  backgroundImage?: string;
}>;
