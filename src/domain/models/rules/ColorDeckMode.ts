// 通常の色カードを山札へ配置する方式を示す。
export enum ColorDeckMode {
  // RGB各成分を個別抽選し、カード種類も分布から選ぶ混色方式。
  RandomMixed = 'randomMixed',
  // R・G・Bの各変化量を主成分とするカードを同数入れる方式。
  BalancedChannels = 'balancedChannels',
}
