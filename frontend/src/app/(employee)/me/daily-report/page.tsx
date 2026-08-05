// 日報プレビュー・提出画面
"use client";

import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import {
  ASSIGNMENT_STATUS_LABEL,
  formatDateLabel,
  formatMinutes,
  formatTime,
  todayString,
} from "@/lib/format";
import type { AssignmentStatus, DailyReportResponse } from "@/types";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

// ステータスに応じたバッジ色
const STATUS_VARIANT: Record<AssignmentStatus, BadgeVariant> = {
  NOT_STARTED: "gray",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
};

const DailyReportPage = () => {
  const date = todayString();
  const [report, setReport] = useState<DailyReportResponse | null>(null);
  const [specialNote, setSpecialNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当日の日報プレビューを取得する
  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data } = await api.get<DailyReportResponse>(
        "/api/v1/me/daily-report",
        { params: { date } }
      );
      setReport(data);
      setSpecialNote(data.special_note ?? "");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "日報の取得に失敗しました"));
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // 日報を提出する
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await api.post("/api/v1/me/daily-report", {
        work_date: date,
        special_note: specialNote,
      });
      setIsConfirmOpen(false);
      await fetchReport();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "日報の提出に失敗しました"));
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="py-10 text-center text-sm text-ink-muted">読み込み中...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-ink">
        日報 <span className="text-sm font-normal text-ink-secondary">{formatDateLabel(date)}</span>
      </h1>

      {/* エラーメッセージ */}
      {error && (
        <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
          {error}
        </div>
      )}

      {/* 提出済みバナー */}
      {report?.submitted && (
        <div className="rounded-xl border border-status-success/30 bg-status-success/10 p-4">
          <p className="text-sm font-bold text-status-success">
            この日報は提出済みです
          </p>
          {report.submitted_at && (
            <p className="mt-0.5 text-xs text-ink-secondary">
              提出時刻: {formatTime(report.submitted_at)}
            </p>
          )}
        </div>
      )}

      {/* 未完了の現場がある場合の警告 */}
      {report && !report.all_completed && !report.submitted && (
        <div className="rounded-xl border border-status-warning/30 bg-status-warning/10 p-4">
          <p className="text-sm font-medium text-status-warning">
            未完了の現場があります
          </p>
          <p className="mt-0.5 text-xs text-ink-secondary">
            提出は可能ですが、作業状況を確認してください
          </p>
        </div>
      )}

      {/* 現場ごとの実績テーブル */}
      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-page/60 text-left">
                <th className="px-3 py-2.5 font-medium text-ink-secondary">現場名</th>
                <th className="px-3 py-2.5 font-medium text-ink-secondary">到着</th>
                <th className="px-3 py-2.5 font-medium text-ink-secondary">離脱</th>
                <th className="px-3 py-2.5 font-medium text-ink-secondary">作業時間</th>
              </tr>
            </thead>
            <tbody>
              {!report || report.visits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-ink-muted">
                    本日の訪問実績はありません
                  </td>
                </tr>
              ) : (
                report.visits.map((visit, index) => (
                  <tr
                    key={`${visit.site_name}-${index}`}
                    className="border-b border-surface-border/60 last:border-b-0"
                  >
                    <td className="px-3 py-2.5">
                      <p className="text-ink">{visit.site_name}</p>
                      <Badge variant={STATUS_VARIANT[visit.status]} className="mt-1">
                        {ASSIGNMENT_STATUS_LABEL[visit.status]}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-ink whitespace-nowrap">
                      {formatTime(visit.arrived_at)}
                    </td>
                    <td className="px-3 py-2.5 text-ink whitespace-nowrap">
                      {formatTime(visit.departed_at)}
                    </td>
                    <td className="px-3 py-2.5 text-ink whitespace-nowrap">
                      {formatMinutes(visit.duration_minutes)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 合計作業時間の強調表示 */}
        <div className="flex items-center justify-between border-t border-surface-border bg-brand-faint px-4 py-3">
          <span className="text-sm font-medium text-ink-secondary">合計作業時間</span>
          <span className="text-xl font-bold text-brand">
            {formatMinutes(report?.total_minutes ?? 0)}
          </span>
        </div>
      </div>

      {/* 特記事項 */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <Textarea
          label="特記事項"
          value={specialNote}
          onChange={setSpecialNote}
          rows={4}
          placeholder="特記事項があれば入力してください"
          disabled={report?.submitted ?? false}
        />
      </div>

      {/* 提出ボタン */}
      {!report?.submitted && (
        <Button
          size="lg"
          className="h-14 w-full text-base"
          onClick={() => setIsConfirmOpen(true)}
          disabled={isSubmitting}
        >
          日報を提出
        </Button>
      )}

      {/* 提出確認ダイアログ */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="日報を提出"
        message={`${formatDateLabel(date)}の日報を提出します。提出後は編集できません。よろしいですか？`}
        confirmLabel="提出する"
        isLoading={isSubmitting}
        onConfirm={handleSubmit}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default DailyReportPage;
