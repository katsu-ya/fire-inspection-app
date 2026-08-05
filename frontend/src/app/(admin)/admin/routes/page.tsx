// ルート設定画面: 職員×日付のルートを編集して丸ごと置き換える
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import { ASSIGNMENT_STATUS_LABEL, todayString } from "@/lib/format";
import type {
  AssignmentStatus,
  RouteAssignment,
  Site,
  SiteSummary,
  User,
} from "@/types";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import SiteSearchSelect from "@/features/routes/SiteSearchSelect";
import BulkRouteModal from "@/features/routes/BulkRouteModal";

// 編集中のルート行（未保存の追加行はstatus=NOT_STARTED扱い）
// siteはAPIのassignmentに埋め込まれる概要形（is_activeを含まない）で保持する
type RouteRow = {
  key: string;
  site: SiteSummary;
  note: string;
  status: AssignmentStatus;
};

// ステータスに応じたバッジ色
const STATUS_VARIANT: Record<AssignmentStatus, BadgeVariant> = {
  NOT_STARTED: "gray",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
};

const RoutesPage = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState(todayString());
  const [rows, setRows] = useState<RouteRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  // 行キー採番用カウンター
  const keyCounter = useRef(0);

  // 一意な行キーを発番する
  const nextKey = (): string => {
    keyCounter.current += 1;
    return `row-${keyCounter.current}`;
  };

  // 職員（EMPLOYEEのみ）を取得する
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await api.get<User[]>("/api/v1/admin/users", {
          params: { role: "EMPLOYEE", is_active: true },
        });
        setEmployees(data);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "職員一覧の取得に失敗しました"));
      }
    };
    fetchEmployees();
  }, []);

  // 選択中の職員・日付のルートを取得する
  const fetchRoutes = useCallback(async () => {
    if (!userId) {
      setRows([]);
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.get<RouteAssignment[]>("/api/v1/admin/routes", {
        params: { user_id: userId, date_from: date, date_to: date },
      });
      const sorted = [...data].sort((a, b) => a.visit_order - b.visit_order);
      setRows(
        sorted.map((a) => ({
          key: nextKey(),
          site: a.site,
          note: a.note ?? "",
          status: a.status,
        }))
      );
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "ルートの取得に失敗しました"));
    } finally {
      setIsLoading(false);
    }
  }, [userId, date]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // 行を上下に移動する
  const moveRow = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
  };

  // 行を削除する
  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // 指示メモを更新する
  const updateNote = (index: number, note: string) => {
    setRows(rows.map((row, i) => (i === index ? { ...row, note } : row)));
  };

  // 現場を末尾に追加する
  const addSite = (site: Site) => {
    setRows([
      ...rows,
      { key: nextKey(), site, note: "", status: "NOT_STARTED" },
    ]);
  };

  // ルートを保存する（丸ごと置き換え）
  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.put("/api/v1/admin/routes", {
        user_id: Number(userId),
        work_date: date,
        sites: rows.map((row) => ({ site_id: row.site.id, note: row.note })),
      });
      setSuccess("ルートを保存しました");
      await fetchRoutes();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "ルートの保存に失敗しました"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 職員・日付選択と操作ボタン */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <Select
            label="職員"
            value={userId}
            onChange={setUserId}
            options={employees.map((u) => ({
              value: String(u.id),
              label: u.name,
            }))}
            placeholder="職員を選択してください"
            className="w-64"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-ink-secondary">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-ink outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
          </div>
          <div className="ml-auto flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsBulkOpen(true)}
              disabled={!userId || rows.length === 0}
            >
              期間一括設定
            </Button>
            <Button onClick={handleSave} disabled={!userId || isSaving}>
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </Card>

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

      {/* ルート編集パネル */}
      {!userId ? (
        <Card>
          <p className="py-8 text-center text-sm text-ink-muted">
            職員と日付を選択するとルートを編集できます
          </p>
        </Card>
      ) : (
        <Card title="訪問順リスト" noPadding>
          <div className="space-y-3 p-5">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-ink-muted">読み込み中...</p>
            ) : rows.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-muted">
                この日のルートはまだ設定されていません
              </p>
            ) : (
              rows.map((row, index) => (
                <div
                  key={row.key}
                  className="flex flex-wrap items-center gap-4 rounded-lg border border-surface-border bg-surface-card p-4 transition-all duration-200 hover:shadow-sm"
                >
                  {/* 訪問順の丸数字 */}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {index + 1}
                  </span>

                  {/* 現場情報 */}
                  <div className="min-w-[12rem] flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-ink">{row.site.name}</p>
                      <Badge variant={STATUS_VARIANT[row.status]}>
                        {ASSIGNMENT_STATUS_LABEL[row.status]}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {row.site.address ?? "住所未登録"}
                      {row.site.building_type ? ` ／ ${row.site.building_type}` : ""}
                    </p>
                  </div>

                  {/* 指示メモ */}
                  <input
                    type="text"
                    value={row.note}
                    onChange={(e) => updateNote(index, e.target.value)}
                    placeholder="指示メモ（任意）"
                    className="w-64 rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-ink placeholder-ink-muted outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand-light"
                  />

                  {/* 並べ替え・削除 */}
                  <div className="flex gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => moveRow(index, -1)}
                      disabled={index === 0}
                    >
                      上へ
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => moveRow(index, 1)}
                      disabled={index === rows.length - 1}
                    >
                      下へ
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeRow(index)}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              ))
            )}

            {/* 現場追加 */}
            <SiteSearchSelect onSelect={addSite} />
          </div>
        </Card>
      )}

      {/* 期間一括設定モーダル */}
      {userId && (
        <BulkRouteModal
          isOpen={isBulkOpen}
          onClose={() => setIsBulkOpen(false)}
          userId={Number(userId)}
          sites={rows.map((row) => ({ site_id: row.site.id, note: row.note }))}
          onSuccess={() => {
            setSuccess("期間一括設定が完了しました");
            fetchRoutes();
          }}
        />
      )}
    </div>
  );
};

export default RoutesPage;
