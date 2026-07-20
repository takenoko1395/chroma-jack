// 通常の色加算カードを山札へ配置する方式を示す。
export enum AddColorDeckMode {
  // RGB各成分を個別抽選する従来の混色方式。
  RandomMixed = 'randomMixed',
  // RGB各色が主成分になるカードを同数入れる方式。
  BalancedDominantChannel = 'balancedDominantChannel',
}
