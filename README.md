# Chroma Jack

画面に現れる色だけを頼りに、現在の色を白へ近づける1人用スコアアタックです。色カードを「加える」か「捨てる」か判断し、ちょうどよいところで止めます。いずれかの色成分を加えすぎるとバーストし、そのラウンドは0点になります。

## 使用技術

- React / TypeScript
- Vite
- MUI（Material UI）
- i18next / react-i18next
- Vitest / React Testing Library
- ESLint / Prettier

## 起動方法

Node.js 20 と npm を使用します。

```bash
npm install
npm run dev
```

ターミナルに表示されるローカルURL（通常は `http://localhost:5173`）をブラウザで開いてください。

## テスト・品質チェック

```bash
npm run test
npm run lint
npm run format:check
npm run build
```

## アーキテクチャ

依存方向を表示からルール側へ向けた、小規模なレイヤー構成です。

- `src/domain/models/color`: 上限を持たない非負整数の色Value Object
- `src/domain/models/hand`: 色カードと、加算・バースト判定・スコア計算を持つ手札モデル
- `src/domain/models/game`: ゲーム進行、ラウンド結果、ゲーム設定
- `src/domain/models/rules`: 色生成傾向、許容バースト色数、スコアのPolicy
- `src/domain/models/shared`: 検証済み整数範囲などの共有Value Object
- `src/domain/repositories`: Domainが要求する外部依存のインターフェース
- `src/domain/usecases`: 開始・加算・破棄・停止・次ラウンドのユースケース
- `src/gateway/repositories`: ブラウザ乱数生成器
- `src/gateway/api/generated`: 将来のAPI生成物の配置先（現在は通信機能なし）
- `src/presentation/pages`: タイトル・ゲーム・最終結果画面
- `src/presentation/providers`: MUIテーマとゲーム状態を接続するフック
- `src/presentation/i18n`: JSON辞書と日本語・英語の表示切り替え
- `src/presentation/rules`: ルール本体と表示用翻訳キーの関連付け
- `src/presentation/router`: アプリケーション状態に基づく画面切り替え
- `src/presentation/widgets`: 再利用可能な表示・操作部品

ゲームロジックはReactやブラウザAPIに依存しません。値の検証とビジネスルールは責任を持つDomain Modelへ集約しています。想定内の生成失敗やゲーム結果は独自Errorではなくenumで表現します。`GameEngine`はゲーム開始時に注入された`GameRules`と乱数生成器を保持するため、ゲーム途中でルールが変わりません。初期色範囲、色生成傾向、許容バースト色数、スコア計算を個別に差し替えられます。

### ルールの差し替え

開始画面のコンボボックスでは`GameRules.classic()`がデフォルトです。1色までのバースト成分を255に固定して続行する`Clamp Challenge`も選択できます。ルールはComposition Rootから次のように初期選択として注入できます。

```tsx
<AppRouter initialRules={GameRules.clampChallenge()} />
```

独自ルールでは`GameRules`へ検証済みの色範囲、`ColorGenerationPolicy`、`OverflowPolicy`、`ScorePolicy`を渡します。`OverflowPolicy`は継続を許す累計バースト色数を0〜2で指定し、3色すべてのバースト継続は許可しません。渡されたルールが表示中に変更されても進行中のゲームには適用せず、次にゲームを開始した時点で採用します。

## 実装済み機能

- ランダムな初期色と12枚の色カードによる全5ラウンド
- カードを加える、捨てる、現在色で止める操作
- 色成分の上限超過によるバースト
- 外部注入できるゲームルールと、許容色数まで255固定で続行するチャレンジルール
- ゲーム開始前のルール選択と、続行可能なバースト色数のプレイ中表示
- JSON辞書を使った日本語・英語表示の切り替え
- 白への距離に基づくラウンドスコアと最終スコア
- ラウンド結果、全ラウンドのスコア一覧
- もう一度遊ぶ、タイトルへ戻る操作
- 約320px幅から使えるレスポンシブ表示
- ゲームルールと主要画面遷移の自動テスト

## 設計上の意図

このゲームは数値計算ではなく色彩感覚を試すため、カードを判断している間はRGB値、カラーコード、予測値を表示しません。バースト継続ルールでは状態を理解できるよう累計バースト色数のみを表示しますが、色成分名や残り許容量は表示しません。ラウンド終了後に限り、判断を振り返れるよう確定色またはバーストを起こした加算後のRGB値を表示します。通信処理はなく、ゲームは完全にブラウザ内で動作します。

## 未実装のTODO

仕様書のTODOにある対戦、ランキング、保存、特殊カード、音、詳細チュートリアル、ダークモード、バックエンドなどは、このプロトタイプでは実装していません。詳細は [`docs/cocept.md`](docs/cocept.md) を参照してください。
