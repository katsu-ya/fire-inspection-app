// 管理者ダッシュボード: 当日の稼働状況・グラフ
"use client";

import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import { addDays, todayString } from "@/lib/format";
import type {
  DashboardSummary,
  FailCategoryCount,
  StaffStatus,
  WeeklyPoint,
} from "@/types";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import WeeklyBarChart from "@/features/admin/WeeklyBarChart";
import FailCategoryChart from "@/features/admin/FailCategoryChart";

// サマリーカードの定義
type SummaryCardDef = {
  label: string;
  value: (s: DashboardSummary) => string;
  iconPath: string;
};

const SUMMARY_CARDS: SummaryCardDef[] = [
  {
    label: "出動職員数",
    value: (s) => `${s.working_employees}名`,
    iconPath:
      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1",
  },
  {
    label: "予定現場数",
    value: (s) => `${s.planned_sites}件`,
    iconPath:
      "M4 21V5a2 2 0 012-2h8a2 2 0 012 2v16M4 21h16M8 7h2m-2 4h2m-2 4h2",
  },
  {
    label: "完了現場数",
    value: (s) => `${s.completed_sites} / ${s.planned_sites}`,
    iconPath: "M5 13l4 4L19 7",
  },
  {
    label: "日報提出数",
    value: (s) => `${s.submitted_daily_reports}件`,
    iconPath:
      "M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm2 5h6m-6 4h6m-6 4h4",
  },
];

const DashboardPage = () => {
  const [date, setDate] = useState(todayString());
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [statusRows, setStatusRows] = useState<StaffStatus[]>([]);
  const [weekly, setWeekly] = useState<WeeklyPoint[]>([]);
  const [failCategories, setFailCategories] = useState<FailCategoryCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ダッシュボードデータを一括取得する
  const fetchAll = useCallback(async (targetDate: string) => {
    setIsLoading(true);
    setError("");
    try {
      const [summaryRes, statusRes, weeklyRes, failRes] = await Promise.all([
        api.get<DashboardSummary>("/api/v1/admin/dashboard/summary", {
          params: { date: targetDate },
        }),
        api.get<StaffStatus[]>("/api/v1/admin/dashboard/status", {
          params: { date: targetDate },
        }),
        api.get<WeeklyPoint[]>("/api/v1/admin/dashboard/weekly"),
        api.get<FailCategoryCount[]>("/api/v1/admin/dashboard/fail-categories", {
          params: { date_from: addDays(targetDate, -6), date_to: targetDate },
        }),
      ]);
      setSummary(summaryRes.data);
      setStatusRows(statusRes.data);
      setWeekly(weeklyRes.data);
      setFailCategories(failRes.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "ダッシュボードの取得に失敗しました"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(date);
  }, [date, fetchAll]);

  return (
    <div className="space-y-6">
      {/* 日付セレクター */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-ink-secondary">対象日</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-ink outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand-light"
        />
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
          {error}
        </div>
      )}

      {/* サマリーカード4枚 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_CARDS.map((def) => (
          <Card key={def.label} className="transition-all duration-200 hover:shadow-md">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-light">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-brand"
                  aria-hidden="true"
                >
                  <path d={def.iconPath} />
                </svg>
              </span>
              <div>
                <p className="text-xs text-ink-muted">{def.label}</p>
                <p className="text-2xl font-bold text-ink">
                  {summary ? def.value(summary) : "-"}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 職員別の当日状況テーブル */}
      <Card title="職員別の当日状況" noPadding>
        <Table<StaffStatus>
          columns={[
            { key: "user_name", label: "職員名" },
            {
              key: "progress",
              label: "進捗",
              className: "w-64",
              render: (row) => {
                const percent =
                  row.total_sites === 0
                    ? 0
                    : Math.round((row.completed_sites / row.total_sites) * 100);
                return (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-surface-page border border-surface-border">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-200"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-ink-secondary whitespace-nowrap">
                      {row.completed_sites} / {row.total_sites} 現場
                    </span>
                  </div>
                );
              },
            },
            {
              key: "current_site_name",
              label: "現在の作業現場",
              render: (row) =>
                row.current_site_name ?? (
                  <span className="text-ink-muted">-</span>
                ),
            },
            {
              key: "daily_report_submitted",
              label: "日報",
              render: (row) =>
                row.daily_report_submitted ? (
                  <Badge variant="success">提出済み</Badge>
                ) : (
                  <Badge variant="gray">未提出</Badge>
                ),
            },
          ]}
          data={statusRows}
          rowKey={(row) => row.user_id}
          isLoading={isLoading}
          emptyMessage="対象日の稼働データがありません"
        />
      </Card>

      {/* グラフ2種 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="直近7日の点検実施状況">
          <WeeklyBarChart data={weekly} />
        </Card>
        <Card title="不良指摘の設備カテゴリ別件数（直近7日）">
          <FailCategoryChart data={failCategories} />
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
