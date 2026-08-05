// 現場作業画面: 到着報告 → 点検入力 → 離脱報告
"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api, { getApiErrorMessage } from "@/lib/api";
import {
  RESULT_LABEL,
  durationMinutes,
  formatDateLabel,
  formatMinutes,
  formatTime,
  todayString,
} from "@/lib/format";
import type {
  InspectionFormItem,
  InspectionResponse,
  InspectionResultInput,
  MyRouteAssignment,
  MyRouteResponse,
} from "@/types";
import Button from "@/components/ui/Button";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import InspectionForm from "@/features/inspection/InspectionForm";

// ステップ定義（① 到着報告 → ② 点検入力 → ③ 離脱報告）
const STEPS = ["到着報告", "点検入力", "離脱報告"] as const;

// ルート更新等でassignmentが見つからない場合の案内メッセージ
const NOT_FOUND_MESSAGE =
  "対象の現場が見つかりません。管理者がルートを更新した可能性があります。ルート一覧から開き直してください";

// 現在のステップ番号を返す（0始まり。完了時は3）
const currentStep = (assignment: MyRouteAssignment): number => {
  if (assignment.status === "NOT_STARTED") return 0;
  if (assignment.status === "IN_PROGRESS") return assignment.has_report ? 2 : 1;
  return 3;
};

// ステップ表示コンポーネント
const StepIndicator = ({ step }: { step: number }) => {
  return (
    <div className="flex items-center rounded-xl border border-surface-border bg-surface-card px-4 py-3 shadow-sm">
      {STEPS.map((label, index) => {
        const isDone = index < step;
        const isCurrent = index === step;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`
                  flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold
                  transition-all duration-200
                  ${
                    isDone
                      ? "bg-status-success text-white"
                      : isCurrent
                        ? "bg-brand text-white"
                        : "border-2 border-surface-border bg-surface-card text-ink-muted"
                  }
                `}
              >
                {isDone ? "✓" : index + 1}
              </span>
              <span
                className={`text-[10px] whitespace-nowrap ${
                  isCurrent ? "font-bold text-brand" : "text-ink-muted"
                }`}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span
                className={`mx-2 mb-4 h-0.5 flex-1 ${
                  index < step ? "bg-status-success" : "bg-surface-border"
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// 点検結果に応じたバッジ（読み取り専用表示用）
const resultBadge = (result: InspectionFormItem["result"]) => {
  if (result === null) return <Badge variant="gray">未入力</Badge>;
  const variant: BadgeVariant =
    result === "PASS" ? "success" : result === "FAIL" ? "danger" : "gray";
  return <Badge variant={variant}>{RESULT_LABEL[result]}</Badge>;
};

// 画面本体（useSearchParams使用のためSuspense配下で描画する）
const VisitContent = () => {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignmentId = Number(params.id);
  const date = searchParams.get("date") ?? todayString();

  const [assignment, setAssignment] = useState<MyRouteAssignment | null>(null);
  const [inspection, setInspection] = useState<InspectionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isActing, setIsActing] = useState(false);

  // ルートから該当assignmentを特定し、必要なら点検フォームも取得する
  // keepMessages=true の場合は表示中のメッセージを消さずに状態のみ再同期する
  const load = useCallback(
    async (options?: { keepMessages?: boolean }) => {
      const keepMessages = options?.keepMessages ?? false;
      if (!keepMessages) {
        setError("");
      }
      try {
        const { data } = await api.get<MyRouteResponse>("/api/v1/me/routes", {
          params: { date },
        });
        let found =
          data.assignments.find((a) => a.id === assignmentId) ?? null;
        // 日付ズレ対策: 指定日で見つからない場合はサーバー基準の当日ルートも照会する
        if (!found) {
          const fallback = await api.get<MyRouteResponse>("/api/v1/me/routes");
          found =
            fallback.data.assignments.find((a) => a.id === assignmentId) ??
            null;
        }
        setAssignment(found);
        if (!found) {
          // 管理者のルート再保存でassignmentが差し替わった（IDが変わった）ケースが典型
          setError(NOT_FOUND_MESSAGE);
          return;
        }
        if (found.status !== "NOT_STARTED") {
          const res = await api.get<InspectionResponse>(
            `/api/v1/me/assignments/${assignmentId}/inspection`
          );
          setInspection(res.data);
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "現場情報の取得に失敗しました"));
      } finally {
        setIsLoading(false);
      }
    },
    [assignmentId, date]
  );

  useEffect(() => {
    load();
  }, [load]);

  // タブ復帰時に最新状態へ再同期する（管理者のルート更新に追従）
  useEffect(() => {
    const handleRefocus = () => {
      if (document.visibilityState === "visible") {
        load();
      }
    };
    window.addEventListener("focus", handleRefocus);
    document.addEventListener("visibilitychange", handleRefocus);
    return () => {
      window.removeEventListener("focus", handleRefocus);
      document.removeEventListener("visibilitychange", handleRefocus);
    };
  }, [load]);

  // 到着報告を送信する
  const handleArrive = async () => {
    setIsActing(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/api/v1/me/assignments/${assignmentId}/arrive`);
      await load();
      setSuccess("到着を報告しました。点検を開始してください");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "到着報告に失敗しました"));
      // ルート更新でassignmentが差し替わっていないか再同期する
      await load({ keepMessages: true });
    } finally {
      setIsActing(false);
    }
  };

  // 点検報告を一時保存する
  const handleSaveInspection = async (
    remarks: string,
    results: InspectionResultInput[]
  ) => {
    setIsActing(true);
    setError("");
    setSuccess("");
    try {
      await api.put(`/api/v1/me/assignments/${assignmentId}/inspection`, {
        remarks,
        results,
      });
      await load();
      setSuccess("点検内容を保存しました");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "点検内容の保存に失敗しました"));
      // ルート更新でassignmentが差し替わっていないか再同期する
      await load({ keepMessages: true });
    } finally {
      setIsActing(false);
    }
  };

  // 離脱報告を送信する
  const handleDepart = async () => {
    setIsActing(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/api/v1/me/assignments/${assignmentId}/depart`);
      await load();
      setSuccess("離脱を報告しました。お疲れさまでした");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "離脱報告に失敗しました"));
      // ルート更新でassignmentが差し替わっていないか再同期する
      await load({ keepMessages: true });
    } finally {
      setIsActing(false);
    }
  };

  // 読み取り専用表示用: カテゴリごとにグループ化する
  const groupedItems = useMemo(() => {
    if (!inspection) return [];
    const groups: Array<{ category: string; items: InspectionFormItem[] }> = [];
    [...inspection.items]
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
  }, [inspection]);

  if (isLoading) {
    return <p className="py-10 text-center text-sm text-ink-muted">読み込み中...</p>;
  }

  if (!assignment) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
          {error || NOT_FOUND_MESSAGE}
        </div>
        <Button onClick={() => router.push("/me/route")}>
          ルート一覧を開き直す
        </Button>
      </div>
    );
  }

  const duration = durationMinutes(assignment.arrived_at, assignment.departed_at);

  return (
    <div className="space-y-4">
      {/* 戻るリンク */}
      <Link
        href="/me/route"
        className="inline-block text-sm text-brand transition-all duration-200 hover:underline"
      >
        ← ルートに戻る
      </Link>

      {/* ステップ表示 */}
      <StepIndicator step={currentStep(assignment)} />

      {/* メッセージ */}
      {error && (
        <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-status-success/30 bg-status-success/10 px-4 py-3 text-sm text-status-success">
          {success}
        </div>
      )}

      {/* 現場情報カード */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <p className="text-xs text-ink-muted">
          {formatDateLabel(assignment.work_date)} ／ 訪問順 {assignment.visit_order}
        </p>
        <p className="mt-1 text-lg font-bold text-ink">{assignment.site.name}</p>
        <p className="mt-1 text-sm text-ink-secondary">
          {assignment.site.address ?? "住所未登録"}
        </p>
        {assignment.site.building_type && (
          <p className="mt-0.5 text-xs text-ink-muted">
            {assignment.site.building_type}
          </p>
        )}
        {assignment.site.contact_name && (
          <p className="mt-2 text-xs text-ink-secondary">
            担当: {assignment.site.contact_name}
            {assignment.site.contact_phone
              ? `（${assignment.site.contact_phone}）`
              : ""}
          </p>
        )}
        {assignment.site.note && (
          <p className="mt-2 rounded-lg bg-surface-page px-3 py-2 text-xs text-ink-secondary">
            <span className="font-medium">現場メモ: </span>
            {assignment.site.note}
          </p>
        )}
        {assignment.note && (
          <p className="mt-2 rounded-lg bg-brand-faint px-3 py-2 text-xs text-ink-secondary">
            <span className="font-medium text-brand">管理者メモ: </span>
            {assignment.note}
          </p>
        )}
      </div>

      {/* 未着手: 到着報告ボタン */}
      {assignment.status === "NOT_STARTED" && (
        <Button
          size="lg"
          className="h-14 w-full text-base"
          onClick={handleArrive}
          disabled={isActing}
        >
          {isActing ? "送信中..." : "到着報告"}
        </Button>
      )}

      {/* 作業中: 点検フォーム+離脱報告 */}
      {assignment.status === "IN_PROGRESS" && inspection && (
        <>
          <InspectionForm
            items={inspection.items}
            initialRemarks={inspection.remarks}
            isSaving={isActing}
            onSave={handleSaveInspection}
          />
          <div className="mb-14 rounded-xl border border-surface-border bg-surface-card p-4 shadow-sm">
            {!assignment.has_report && (
              <p className="mb-2 text-xs text-ink-muted">
                点検内容を一時保存すると離脱報告ができます
              </p>
            )}
            <Button
              variant="success"
              size="lg"
              className="h-14 w-full text-base"
              onClick={handleDepart}
              disabled={isActing || !assignment.has_report}
            >
              {isActing ? "送信中..." : "離脱報告"}
            </Button>
          </div>
        </>
      )}

      {/* 完了: 読み取り専用表示 */}
      {assignment.status === "COMPLETED" && (
        <div className="space-y-4">
          {/* 作業時間 */}
          <div className="flex items-center justify-around rounded-xl border border-surface-border bg-surface-card p-4 shadow-sm">
            <div className="text-center">
              <p className="text-xs text-ink-muted">到着</p>
              <p className="text-sm font-bold text-ink">
                {formatTime(assignment.arrived_at)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-ink-muted">離脱</p>
              <p className="text-sm font-bold text-ink">
                {formatTime(assignment.departed_at)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-ink-muted">作業時間</p>
              <p className="text-sm font-bold text-brand">
                {formatMinutes(duration)}
              </p>
            </div>
          </div>

          {/* 点検結果（読み取り専用） */}
          {groupedItems.map((group) => (
            <section
              key={group.category}
              className="overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm"
            >
              <p className="border-b border-surface-border px-4 py-3 text-sm font-semibold text-ink">
                {group.category}
              </p>
              <ul className="divide-y divide-surface-border/60">
                {group.items.map((item) => (
                  <li
                    key={item.item_id}
                    className={`space-y-1 px-4 py-3 ${
                      item.result === "FAIL" ? "bg-status-danger/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-ink">{item.name}</p>
                      {resultBadge(item.result)}
                    </div>
                    {item.note && (
                      <p className="text-xs text-ink-secondary">{item.note}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* 全体所見 */}
          <div className="rounded-xl border border-surface-border bg-surface-card p-4 shadow-sm">
            <p className="mb-1 text-xs font-medium text-ink-muted">全体所見</p>
            <p className="text-sm text-ink whitespace-pre-wrap">
              {inspection?.remarks || "（記載なし）"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// useSearchParamsを使うためSuspenseで包む
const VisitPage = () => {
  return (
    <Suspense
      fallback={
        <p className="py-10 text-center text-sm text-ink-muted">読み込み中...</p>
      }
    >
      <VisitContent />
    </Suspense>
  );
};

export default VisitPage;
