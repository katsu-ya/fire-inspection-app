// 日報一覧画面: 日付・職員フィルター付きの日報カード一覧
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { getApiErrorMessage } from "@/lib/api";
import {
  ASSIGNMENT_STATUS_LABEL,
  formatDateLabel,
  formatMinutes,
  formatTime,
  todayString,
} from "@/lib/format";
import type { AdminDailyReport, AdminDailyReportVisit, AssignmentStatus, User } from "@/types";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Select from "@/components/ui/Select";

// ステータスに応じたバッジ色
const STATUS_VARIANT: Record<AssignmentStatus, BadgeVariant> = {
  NOT_STARTED: "gray",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
};

const DailyReportsPage = () => {
  const router = useRouter();
  const [date, setDate] = useState(todayString());
  const [employees, setEmployees] = useState<User[]>([]);
  const [userId, setUserId] = useState("");
  const [reports, setReports] = useState<AdminDailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 職員（EMPLOYEEのみ）を取得する
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await api.get<User[]>("/api/v1/admin/users", {
          params: { role: "EMPLOYEE" },
        });
        setEmployees(data);
      } catch {
        // フィルター用のため取得失敗は致命的でない
      }
    };
    fetchEmployees();
  }, []);

  // 日報一覧を取得する
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params: Record<string, string> = { date };
      if (userId) params.user_id = userId;
      const { data } = await api.get<AdminDailyReport[]>(
        "/api/v1/admin/daily-reports",
        { params }
      );
      setReports(data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "日報一覧の取得に失敗しました"));
    } finally {
      setIsLoading(false);
    }
  }, [date, userId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink-secondary">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-ink outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
          </div>
          <Select
            label="職員"
            value={userId}
            onChange={setUserId}
            options={employees.map((u) => ({
              value: String(u.id),
              label: u.name,
            }))}
            placeholder="すべての職員"
            className="w-56"
          />
        </div>
      </Card>

      {error && (
        <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
          {error}
        </div>
      )}

      {/* 日報カード一覧 */}
      {isLoading ? (
        <Card>
          <p className="py-8 text-center text-sm text-ink-muted">読み込み中...</p>
        </Card>
      ) : reports.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-ink-muted">
            {formatDateLabel(date)} の日報はありません
          </p>
        </Card>
      ) : (
        reports.map((report) => (
          <Card
            key={`${report.user_id}-${report.work_date}`}
            title={`${report.user_name} ／ ${formatDateLabel(report.work_date)}`}
            action={
              report.submitted_at ? (
                <span className="text-xs text-ink-muted">
                  提出 {formatTime(report.submitted_at)}
                </span>
              ) : undefined
            }
            noPadding
          >
            <div className="p-5 space-y-4">
              {/* 現場ごとの実績テーブル（行クリックで点検報告詳細へ） */}
              <Table<AdminDailyReportVisit>
                columns={[
                  { key: "site_name", label: "現場名" },
                  {
                    key: "status",
                    label: "ステータス",
                    render: (row) => (
                      <Badge variant={STATUS_VARIANT[row.status]}>
                        {ASSIGNMENT_STATUS_LABEL[row.status]}
                      </Badge>
                    ),
                  },
                  {
                    key: "arrived_at",
                    label: "到着",
                    render: (row) => formatTime(row.arrived_at),
                  },
                  {
                    key: "departed_at",
                    label: "離脱",
                    render: (row) => formatTime(row.departed_at),
                  },
                  {
                    key: "duration_minutes",
                    label: "作業時間",
                    render: (row) => formatMinutes(row.duration_minutes),
                  },
                  {
                    key: "link",
                    label: "",
                    className: "w-28",
                    render: () => (
                      <span className="text-xs font-medium text-brand">
                        点検報告 →
                      </span>
                    ),
                  },
                ]}
                data={report.visits}
                rowKey={(row) => row.assignment_id}
                onRowClick={(row) =>
                  router.push(`/admin/reports/${row.assignment_id}`)
                }
                emptyMessage="訪問実績がありません"
              />

              {/* 合計時間・特記事項 */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-[16rem] flex-1 rounded-lg bg-surface-page p-4">
                  <p className="mb-1 text-xs font-medium text-ink-muted">特記事項</p>
                  <p className="text-sm text-ink whitespace-pre-wrap">
                    {report.special_note || "（なし）"}
                  </p>
                </div>
                <div className="rounded-lg bg-brand-faint px-5 py-4 text-right">
                  <p className="text-xs text-ink-muted">合計作業時間</p>
                  <p className="text-xl font-bold text-brand">
                    {formatMinutes(report.total_minutes)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default DailyReportsPage;
