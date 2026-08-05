// 点検報告詳細画面: 現場情報・作業時間・カテゴリごとの点検結果
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { getApiErrorMessage } from "@/lib/api";
import {
  ASSIGNMENT_STATUS_LABEL,
  RESULT_LABEL,
  durationMinutes,
  formatDateLabel,
  formatMinutes,
  formatTime,
} from "@/lib/format";
import type { AssignmentStatus, InspectionFormItem, ReportDetail } from "@/types";
import Card from "@/components/ui/Card";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

// ステータスに応じたバッジ色
const STATUS_VARIANT: Record<AssignmentStatus, BadgeVariant> = {
  NOT_STARTED: "gray",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
};

// 点検結果に応じたバッジ色（null=未入力）
const resultBadge = (result: InspectionFormItem["result"]) => {
  if (result === null) return <Badge variant="gray">未入力</Badge>;
  const variant: BadgeVariant =
    result === "PASS" ? "success" : result === "FAIL" ? "danger" : "gray";
  return <Badge variant={variant}>{RESULT_LABEL[result]}</Badge>;
};

const ReportDetailPage = () => {
  const params = useParams<{ assignmentId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 点検報告詳細を取得する
  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      setError("");
      try {
        const { data } = await api.get<ReportDetail>(
          `/api/v1/admin/reports/${params.assignmentId}`
        );
        setReport(data);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "点検報告の取得に失敗しました"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [params.assignmentId]);

  // カテゴリごとにグループ化する（display_order順を維持）
  const groupedItems = useMemo(() => {
    if (!report) return [];
    const groups: Array<{ category: string; items: InspectionFormItem[] }> = [];
    [...report.items]
      .sort((a, b) => a.display_order - b.display_order)
      .forEach((item) => {
        const group = groups.find((g) => g.category === item.category);
        if (group) {
          group.items.push(item);
        } else {
          groups.push({ category: item.category, items: [item] });
        }
      });
    return groups;
  }, [report]);

  if (isLoading) {
    return (
      <Card>
        <p className="py-8 text-center text-sm text-ink-muted">読み込み中...</p>
      </Card>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
          {error || "点検報告が見つかりません"}
        </div>
        <Button variant="secondary" onClick={() => router.back()}>
          戻る
        </Button>
      </div>
    );
  }

  const duration = durationMinutes(report.arrived_at, report.departed_at);

  return (
    <div className="space-y-6">
      {/* 戻るリンク */}
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        ← 戻る
      </Button>

      {/* 現場情報・作業時間のヘッダー */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-ink">{report.site.name}</h2>
              <Badge variant={STATUS_VARIANT[report.status]}>
                {ASSIGNMENT_STATUS_LABEL[report.status]}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-ink-secondary">
              {report.site.address ?? "住所未登録"}
              {report.site.building_type ? ` ／ ${report.site.building_type}` : ""}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              担当職員: {report.user_name} ／ {formatDateLabel(report.work_date)}
            </p>
          </div>
          <div className="flex gap-6 rounded-lg bg-surface-page px-5 py-3">
            <div className="text-center">
              <p className="text-xs text-ink-muted">到着</p>
              <p className="text-sm font-bold text-ink">{formatTime(report.arrived_at)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-ink-muted">離脱</p>
              <p className="text-sm font-bold text-ink">{formatTime(report.departed_at)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-ink-muted">作業時間</p>
              <p className="text-sm font-bold text-brand">{formatMinutes(duration)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* カテゴリごとの点検結果 */}
      {groupedItems.map((group) => (
        <Card key={group.category} title={group.category} noPadding>
          <ul>
            {group.items.map((item) => (
              <li
                key={item.item_id}
                className={`
                  flex flex-wrap items-center gap-3 border-b border-surface-border/60 px-5 py-3
                  last:border-b-0
                  ${item.result === "FAIL" ? "bg-status-danger/5" : ""}
                `}
              >
                <span className="flex-1 text-sm text-ink">{item.name}</span>
                {resultBadge(item.result)}
                {item.note && (
                  <span className="w-full text-xs text-ink-secondary sm:w-auto sm:max-w-xs">
                    {item.note}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      ))}

      {/* 全体所見 */}
      <Card title="全体所見">
        <p className="text-sm text-ink whitespace-pre-wrap">
          {report.remarks || "（記載なし）"}
        </p>
      </Card>
    </div>
  );
};

export default ReportDetailPage;
