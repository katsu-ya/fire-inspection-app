# 詳細設計書：日報の過去3日分遡り提出

関連ドキュメント: `docs/design/daily-report-past-3days-basic-design.md`（基本設計書）

## 1. 変更対象ファイル

| ファイル | 変更内容 |
|---|---|
| `frontend/src/app/(employee)/me/daily-report/page.tsx` | 日付をstate管理に変更し、日付切替UIを追加 |
| `docs/requirements/frontend.md` | 日報画面の仕様記述を更新（PR作成時に対応） |

バックエンド（`DailyReportService`, `MeController`, `DailyReportRepository`等）は
変更しない。理由は基本設計書「5. 調査結果」を参照。

## 2. 参考にした既存実装

`frontend/src/app/(employee)/me/routes/page.tsx`（本日のルート画面）に、
日付切替の実装が既に存在するため、同じパターンを踏襲する。

## 3. 変更内容の詳細

### 3.1 日付のstate管理化

**変更前**
```typescript
const date = todayString();
```

**変更後**
```typescript
const [date, setDate] = useState(todayString());
```

`date`を固定値から`useState`によるstateに変更し、`setDate`で
値を更新できるようにする。これにより、日付が変わるたびに
`fetchReport`（`useCallback`の依存配列に`date`を含む）が
自動的に再実行され、表示内容が切り替わる。

### 3.2 importの追加

`@/lib/format` からのimportに `addDays` を追加する。

```typescript
import {
  ASSIGNMENT_STATUS_LABEL,
  addDays,
  formatDateLabel,
  formatMinutes,
  formatTime,
  todayString,
} from "@/lib/format";
```

### 3.3 日付切替UIの追加

既存の見出し（`<h1>`）部分を、以下の構造に置き換える。

```tsx
{/* 日付切替 */}
<div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-card px-2 py-2 shadow-sm">
  <button
    onClick={() => setDate(addDays(date, -1))}
    disabled={date <= addDays(todayString(), -3)}
    className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-secondary transition-all duration-200 hover:bg-brand-faint disabled:opacity-30"
    aria-label="前日"
  >
    ‹
  </button>
  <div className="text-center">
    <h1 className="text-lg font-bold text-ink">
      日報 <span className="text-sm font-normal text-ink-secondary">{formatDateLabel(date)}</span>
    </h1>
    {date !== todayString() && (
      <button
        onClick={() => setDate(todayString())}
        className="text-xs text-brand transition-all duration-200 hover:underline"
      >
        今日に戻る
      </button>
    )}
  </div>
  <div className="h-10 w-10" /> {/* 右側の空白（翌日ボタンは設けないためバランス用） */}
</div>
```

#### 実装のポイント

- **前日ボタンの制御**：`disabled={date <= addDays(todayString(), -3)}`により、
  表示中の日付が「今日から3日前」以下になった場合、ボタンを無効化する。
  日付は `YYYY-MM-DD` 形式の文字列であるため、文字列としての比較（`<=`）が
  そのまま日付の大小比較として成立する。
- **翌日ボタンは設けない**：日報は「その日の実績」を記録するものであり、
  未来日は概念的に存在しないため、`me/routes/page.tsx`と異なり
  翌日ボタンは実装しない。
- **右側の空白要素**：翌日ボタンが無いことで左右のバランスが崩れないよう、
  同サイズ（`h-10 w-10`）の空div要素を配置する。
- **「今日に戻る」ボタン**：`date !== todayString()` の場合のみ表示する
  条件付きレンダリング。

## 4. 既存ロジックとの整合性

以下は、`date`の変更に伴い自動的に追従するため、追加の実装は不要。

- `fetchReport`（`useCallback`、依存配列に`date`を含む）
  → `date`が変わるたびに、選択日の日報プレビューを再取得する
- `handleSubmit`（日報提出処理）
  → `work_date: date` として、選択中の日付をそのままAPIに送信するため、
    3日前の日付を選択していれば、その日付で提出される

## 5. 動作確認項目（詳細）

| No | 確認内容 | 期待結果 |
|---|---|---|
| 1 | 初期表示 | 当日の日報が表示される |
| 2 | 前日ボタンを1回押す | 前日の日報プレビューが表示される |
| 3 | 前日ボタンを3回押す（3日前まで） | 3日前の日報プレビューが表示され、前日ボタンが無効化される |
| 4 | 3日前の状態から、さらに前日ボタンを押そうとする | ボタンが無効化されており押せない |
| 5 | 前日を表示中に「今日に戻る」を押す | 当日の表示に戻る |
| 6 | 3日前の日報を提出する | `workDate`が3日前の日付として保存される |
| 7 | 当日の表示中 | 「今日に戻る」ボタンが表示されない |

## 6. 未実施・保留事項

- テストコードの追加：`frontend/src`, `backend/src`のいずれにも
  テストの仕組み（Jest, JUnit等）が未導入であることを確認済み。
  対応方針は別途確認中。
- `docs/requirements/frontend.md`の更新：PR作成時に、本改修による
  差分と合わせて反映する。
