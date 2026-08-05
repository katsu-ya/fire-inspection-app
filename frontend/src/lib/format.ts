// 日付・時刻・作業時間の整形ユーティリティ
import type { AssignmentStatus, InspectionResultValue } from "@/types";

// 曜日ラベル
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

// 'YYYY-MM-DD' 文字列をローカルタイムのDateに変換する
const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// ISO日時文字列を 'HH:mm' に整形する（nullは '--:--'）
export const formatTime = (iso: string | null): string => {
  if (!iso) return "--:--";
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

// 'YYYY-MM-DD' を 'M月D日(曜)' に整形する
export const formatDateLabel = (dateStr: string): string => {
  const d = parseDate(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAYS[d.getDay()]})`;
};

// 'YYYY-MM-DD' を 'M/D' に整形する（グラフ軸用）
export const formatShortDate = (dateStr: string): string => {
  const d = parseDate(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

// 分を 'x時間y分' に整形する（nullは '-'）
export const formatMinutes = (minutes: number | null): string => {
  if (minutes === null || minutes === undefined) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
};

// Dateを 'YYYY-MM-DD' に整形する
export const toDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// 当日の 'YYYY-MM-DD' を返す
export const todayString = (): string => toDateString(new Date());

// 'YYYY-MM-DD' にdays日を加算した 'YYYY-MM-DD' を返す（負数で減算）
export const addDays = (dateStr: string, days: number): string => {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return toDateString(d);
};

// 到着・離脱のISO日時から作業時間（分）を計算する（どちらか欠けていればnull）
export const durationMinutes = (
  arrivedAt: string | null,
  departedAt: string | null
): number | null => {
  if (!arrivedAt || !departedAt) return null;
  const diffMs = new Date(departedAt).getTime() - new Date(arrivedAt).getTime();
  if (diffMs < 0) return null;
  return Math.floor(diffMs / 60000);
};

// ============ ステータス表示ラベル ============

// 作業ステータスの日本語ラベル
export const ASSIGNMENT_STATUS_LABEL: Record<AssignmentStatus, string> = {
  NOT_STARTED: "未着手",
  IN_PROGRESS: "作業中",
  COMPLETED: "完了",
};

// 点検結果の日本語ラベル
export const RESULT_LABEL: Record<InspectionResultValue, string> = {
  PASS: "良",
  FAIL: "不良",
  NA: "対象外",
};
