// ルートの期間一括設定モーダル（同じ現場に1週間通うケース用）
"use client";

import { useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import type { RouteSiteInput } from "@/types";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { todayString } from "@/lib/format";

type BulkRouteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // 対象職員のID
  userId: number;
  // 一括設定する現場リスト（配列順=訪問順）
  sites: RouteSiteInput[];
  // 成功時のコールバック
  onSuccess: () => void;
};

const BulkRouteModal = ({
  isOpen,
  onClose,
  userId,
  sites,
  onSuccess,
}: BulkRouteModalProps) => {
  const [dateFrom, setDateFrom] = useState(todayString());
  const [dateTo, setDateTo] = useState(todayString());
  const [skipWeekends, setSkipWeekends] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 一括設定を実行する
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await api.post("/api/v1/admin/routes/bulk", {
        user_id: userId,
        date_from: dateFrom,
        date_to: dateTo,
        skip_weekends: skipWeekends,
        sites,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "期間一括設定に失敗しました"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="期間一括設定">
      <div className="space-y-4">
        <p className="text-sm text-ink-secondary">
          現在編集中の現場リスト（{sites.length}件）を指定期間の各日に一括設定します。
          既存のルートは上書きされます。
        </p>

        {/* エラーメッセージ */}
        {error && (
          <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink-secondary">開始日</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-ink outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink-secondary">終了日</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-ink outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
          </div>
        </div>

        {/* 土日スキップ */}
        <label className="flex items-center gap-2 text-sm text-ink-secondary">
          <input
            type="checkbox"
            checked={skipWeekends}
            onChange={(e) => setSkipWeekends(e.target.checked)}
            className="h-4 w-4 accent-[#1d4ed8]"
          />
          土日をスキップする
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || sites.length === 0}>
            {isSubmitting ? "設定中..." : "一括設定する"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkRouteModal;
