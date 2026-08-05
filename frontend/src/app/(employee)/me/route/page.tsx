// 本日のルート画面: 縦タイムラインで訪問順に現場カードを表示
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import api, { getApiErrorMessage } from "@/lib/api";
import {
  ASSIGNMENT_STATUS_LABEL,
  addDays,
  formatDateLabel,
  formatTime,
  todayString,
} from "@/lib/format";
import type { AssignmentStatus, MyRouteResponse } from "@/types";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";

// ステータスに応じたバッジ色
const STATUS_VARIANT: Record<AssignmentStatus, BadgeVariant> = {
  NOT_STARTED: "gray",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
};

const MyRoutePage = () => {
  const [date, setDate] = useState(todayString());
  const [route, setRoute] = useState<MyRouteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 指定日のルートを取得する（silent=trueなら読み込み表示なしで再同期のみ行う）
  const fetchRoute = useCallback(async (targetDate: string, silent = false) => {
    if (!silent) {
      setIsLoading(true);
      setError("");
    }
    try {
      const { data } = await api.get<MyRouteResponse>("/api/v1/me/routes", {
        params: { date: targetDate },
      });
      setRoute(data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "ルートの取得に失敗しました"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoute(date);
  }, [date, fetchRoute]);

  // タブ復帰時に最新ルートへ再同期する（管理者のルート更新に追従）
  useEffect(() => {
    const handleRefocus = () => {
      if (document.visibilityState === "visible") {
        fetchRoute(date, true);
      }
    };
    window.addEventListener("focus", handleRefocus);
    document.addEventListener("visibilitychange", handleRefocus);
    return () => {
      window.removeEventListener("focus", handleRefocus);
      document.removeEventListener("visibilitychange", handleRefocus);
    };
  }, [date, fetchRoute]);

  const assignments = route?.assignments ?? [];
  const completedCount = assignments.filter((a) => a.status === "COMPLETED").length;
  const totalCount = assignments.length;
  const progressPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const allCompleted = totalCount > 0 && completedCount === totalCount;
  const isToday = date === todayString();

  return (
    <div className="space-y-4">
      {/* 日付切替 */}
      <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-card px-2 py-2 shadow-sm">
        <button
          onClick={() => setDate(addDays(date, -1))}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-secondary transition-all duration-200 hover:bg-brand-faint"
          aria-label="前日"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="text-base font-bold text-ink">{formatDateLabel(date)}</p>
          {!isToday && (
            <button
              onClick={() => setDate(todayString())}
              className="text-xs text-brand transition-all duration-200 hover:underline"
            >
              今日に戻る
            </button>
          )}
        </div>
        <button
          onClick={() => setDate(addDays(date, 1))}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-secondary transition-all duration-200 hover:bg-brand-faint"
          aria-label="翌日"
        >
          ›
        </button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
          {error}
        </div>
      )}

      {/* 進捗サマリー */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-sm text-ink-secondary">本日の進捗</p>
          <p className="text-sm font-bold text-ink">
            {totalCount}現場中 {completedCount}現場 完了
          </p>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-page border border-surface-border">
          <div
            className="h-full rounded-full bg-brand transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 全現場完了時の日報導線バナー */}
      {allCompleted && (
        <Link
          href="/me/daily-report"
          className="block rounded-xl border border-status-success/30 bg-status-success/10 p-4 transition-all duration-200 hover:bg-status-success/15"
        >
          <p className="text-sm font-bold text-status-success">
            全現場の作業が完了しました
          </p>
          <p className="mt-0.5 text-xs text-ink-secondary">
            日報を確認して提出しましょう →
          </p>
        </Link>
      )}

      {/* 縦タイムライン */}
      {isLoading ? (
        <p className="py-10 text-center text-sm text-ink-muted">読み込み中...</p>
      ) : assignments.length === 0 ? (
        <div className="rounded-xl border border-surface-border bg-surface-card p-8 text-center shadow-sm">
          <p className="text-sm text-ink-muted">この日のルートはありません</p>
        </div>
      ) : (
        <ol>
          {assignments.map((assignment, index) => (
            <li key={assignment.id} className="relative pb-4 pl-12 last:pb-0">
              {/* タイムラインの縦線 */}
              {index < assignments.length - 1 && (
                <span
                  className="absolute bottom-0 left-[15px] top-9 w-0.5 bg-surface-border"
                  aria-hidden="true"
                />
              )}

              {/* タイムラインノード（訪問順） */}
              <span className="absolute left-0 top-1.5">
                {assignment.status === "COMPLETED" ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-status-success text-white">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                ) : assignment.status === "IN_PROGRESS" ? (
                  <span className="relative flex h-8 w-8">
                    {/* 作業中は青パルス */}
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" />
                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      {assignment.visit_order}
                    </span>
                  </span>
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-border bg-surface-card text-sm font-bold text-ink-muted">
                    {assignment.visit_order}
                  </span>
                )}
              </span>

              {/* 現場カード（タップで作業画面へ） */}
              <Link
                href={`/me/visits/${assignment.id}?date=${date}`}
                className="block rounded-xl border border-surface-border bg-surface-card p-4 shadow-sm transition-all duration-200 hover:border-brand hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-ink">
                    {assignment.site.name}
                  </p>
                  <Badge variant={STATUS_VARIANT[assignment.status]}>
                    {ASSIGNMENT_STATUS_LABEL[assignment.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-ink-secondary">
                  {assignment.site.address ?? "住所未登録"}
                </p>
                {assignment.site.building_type && (
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {assignment.site.building_type}
                  </p>
                )}
                {assignment.note && (
                  <p className="mt-2 rounded-lg bg-brand-faint px-3 py-2 text-xs text-ink-secondary">
                    <span className="font-medium text-brand">管理者メモ: </span>
                    {assignment.note}
                  </p>
                )}
                {(assignment.arrived_at || assignment.departed_at) && (
                  <p className="mt-2 text-xs text-ink-muted">
                    到着 {formatTime(assignment.arrived_at)} ／ 離脱{" "}
                    {formatTime(assignment.departed_at)}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default MyRoutePage;
