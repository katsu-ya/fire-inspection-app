# フロントエンド要件 — Phase 3: Next.js + TypeScript + Tailwind CSS

## 前提

`docs/requirements/backend.md` のバックエンドAPIが正常に動作していること。

---

## ディレクトリ構成

```
frontend/
├── Dockerfile
├── tailwind.config.ts
├── src/
│   ├── app/                          # App Router
│   │   ├── layout.tsx                # ルートレイアウト（フォント・グローバルCSS）
│   │   ├── page.tsx                  # / → /dashboard にリダイレクト
│   │   ├── (auth)/
│   │   │   └── login/page.tsx        # ログイン画面
│   │   └── (app)/                    # 認証済みユーザー向けレイアウト
│   │       ├── layout.tsx            # サイドバー + ヘッダー共通レイアウト
│   │       ├── dashboard/page.tsx
│   │       ├── products/
│   │       │   ├── page.tsx          # 商品一覧
│   │       │   ├── new/page.tsx      # 新規登録
│   │       │   └── [id]/page.tsx     # 詳細・編集
│   │       ├── inventory/page.tsx    # 入出庫登録・履歴
│   │       ├── alerts/page.tsx
│   │       └── reports/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── ui/                       # 汎用UIコンポーネント
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Table.tsx             # ソート・ページネーション対応
│   │       ├── Badge.tsx
│   │       └── AlertBanner.tsx
│   ├── features/                     # 機能別コンポーネント
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── inventory/
│   │   └── reports/
│   ├── hooks/
│   │   ├── useAuth.ts                # 認証状態管理
│   │   └── useAlert.ts               # アラート状態管理
│   ├── lib/
│   │   ├── api.ts                    # axiosインスタンス（ベースURL・インターセプター設定）
│   │   └── auth.ts                   # トークン保存・取得・削除
│   └── types/
│       └── index.ts                  # APIレスポンス型定義（一元管理）
```

---

## デザイン仕様

### カラーテーマ（tailwind.config.ts に追加）

```ts
colors: {
  background: {
    primary:   '#0f172a',   // メイン背景
    secondary: '#1e293b',   // カード・サイドバー背景
    tertiary:  '#334155',   // ホバー・ボーダー
  },
  accent: {
    DEFAULT: '#06b6d4',     // シアン（メインアクセント）
    hover:   '#0891b2',
    muted:   '#164e63',
  },
  text: {
    primary:   '#f1f5f9',
    secondary: '#94a3b8',
    muted:     '#475569',
  },
  status: {
    danger:  '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
  },
}
```

### レイアウト

- 左サイドバー（幅240px・固定）＋ メインコンテンツエリア
- サイドバーは `background.secondary` 背景に白テキスト
- アクティブなメニュー項目は `accent` 色でハイライト
- カードは `background.secondary` 背景 + `border border-background-tertiary`
- インタラクション要素には `transition-all duration-200` を付与する

---

## 画面仕様

### ログイン `/login`

- 中央配置のログインカード
- メールアドレス・パスワード入力フォーム
- ログイン成功後 `/dashboard` にリダイレクト
- エラー時はカード上部にエラーメッセージを表示

### ダッシュボード `/dashboard`

- サマリーカード4枚（総商品数・総在庫数・アラート件数・本日の入出庫件数）
- アラートが1件以上ある場合は画面上部に赤い `AlertBanner` を表示
- グラフ3種（rechartsを使用）
  - 在庫推移折れ線グラフ（直近30日）
  - カテゴリ別在庫割合の円グラフ
  - 日別入出庫の棒グラフ（直近7日、入庫=シアン / 出庫=コーラル）

### 商品管理 `/products`

- 商品一覧テーブル（ソート・ページネーション・キーワード検索・カテゴリフィルター）
- 在庫数を `Badge` で表示（閾値以下=赤・閾値の1.5倍以下=黄・それ以上=緑）
- 新規登録・編集はモーダルフォームで行う
- 削除は確認ダイアログ表示後に論理削除

### 在庫入出庫 `/inventory`

- 上部に入庫フォームと出庫フォームを横並びで配置
  - 商品選択（セレクトボックス）・数量・備考を入力
- 下部に入出庫履歴テーブル（日付範囲・商品・種別でフィルター可能）
- 種別カラムは `入庫`（シアン）/ `出庫`（コーラル）の `Badge` で表示

### アラート一覧 `/alerts`

- アラート中の商品を一覧表示（現在庫数と閾値の差分を強調表示）
- 商品名クリックで商品詳細に遷移

### レポート `/reports`

- 期間セレクター（直近7日・30日・90日・カスタム）
- 在庫推移グラフ（商品を複数選択して比較できる）
- 入出庫サマリーテーブル（商品別集計）

---

## APIクライアント設計

- `lib/api.ts` でaxiosインスタンスを作成し、すべてのAPIコールはここ経由で行う
- リクエストインターセプターで `Authorization: Bearer <token>` ヘッダーを自動付与する
- レスポンスインターセプターで401エラーを検知したらリフレッシュトークンで再取得を試み、
  それも失敗したら `/login` にリダイレクトする
- トークンは `localStorage` に保存する

## 認証フロー

- 未認証ユーザーが `(app)` 配下にアクセスした場合は `/login` にリダイレクト
- `useAuth` フックで認証状態をグローバル管理する

---

## 完了条件

- [ ] ログイン・ログアウトが正常に動作する
- [ ] 未認証状態で保護ページにアクセスするとログイン画面にリダイレクトされる
- [ ] ダッシュボードのグラフ3種が実データで表示される
- [ ] 商品のCRUD操作がUIから行える
- [ ] 在庫入庫・出庫をUIから登録でき、テーブルに即時反映される
- [ ] アラートバナーが閾値以下の商品が存在するときだけ表示される
- [ ] レポート画面でグラフが正しく描画される
