// 点検項目マスタ画面: 設備カテゴリごとにグループ化した一覧・登録・編集・論理削除
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import type { InspectionItem, InspectionItemRequest } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

// フォームの入力値（display_orderは文字列で保持して送信時に数値化）
type ItemForm = {
  category: string;
  name: string;
  display_order: string;
};

const EMPTY_FORM: ItemForm = {
  category: "",
  name: "",
  display_order: "0",
};

const ItemsPage = () => {
  const [items, setItems] = useState<InspectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // モーダル状態（editTarget=nullなら新規登録）
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InspectionItem | null>(null);
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 削除確認状態
  const [deleteTarget, setDeleteTarget] = useState<InspectionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 点検項目一覧を取得する（API側でcategory, display_order順）
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data } = await api.get<InspectionItem[]>(
        "/api/v1/admin/inspection-items"
      );
      setItems(data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "点検項目の取得に失敗しました"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // カテゴリごとにグループ化する（APIの並び順を維持）
  const groupedItems = useMemo(() => {
    const groups: Array<{ category: string; items: InspectionItem[] }> = [];
    items.forEach((item) => {
      const group = groups.find((g) => g.category === item.category);
      if (group) {
        group.items.push(item);
      } else {
        groups.push({ category: item.category, items: [item] });
      }
    });
    return groups;
  }, [items]);

  // 新規登録モーダルを開く（カテゴリ指定があれば初期値にする）
  const openCreateModal = (category = "") => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, category });
    setFormError("");
    setIsModalOpen(true);
  };

  // 編集モーダルを開く
  const openEditModal = (item: InspectionItem) => {
    setEditTarget(item);
    setForm({
      category: item.category,
      name: item.name,
      display_order: String(item.display_order),
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // 登録・更新を実行する
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFormError("");
    try {
      const body: InspectionItemRequest = {
        category: form.category,
        name: form.name,
        display_order: Number(form.display_order) || 0,
      };
      if (editTarget) {
        await api.put(`/api/v1/admin/inspection-items/${editTarget.id}`, body);
      } else {
        await api.post("/api/v1/admin/inspection-items", body);
      }
      setIsModalOpen(false);
      await fetchItems();
    } catch (err: unknown) {
      setFormError(getApiErrorMessage(err, "保存に失敗しました"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 論理削除を実行する
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/v1/admin/inspection-items/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchItems();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "削除に失敗しました"));
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
          {error}
        </div>
      )}

      {/* ヘッダー操作 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-secondary">
          全現場共通の点検フォーマットを設備カテゴリごとに管理します
        </p>
        <Button onClick={() => openCreateModal()}>新規登録</Button>
      </div>

      {/* カテゴリごとのグループ表示 */}
      {isLoading ? (
        <Card>
          <p className="py-8 text-center text-sm text-ink-muted">読み込み中...</p>
        </Card>
      ) : groupedItems.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-ink-muted">
            点検項目が登録されていません
          </p>
        </Card>
      ) : (
        groupedItems.map((group) => (
          <Card
            key={group.category}
            title={group.category}
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openCreateModal(group.category)}
              >
                このカテゴリに追加
              </Button>
            }
            noPadding
          >
            <ul>
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 border-b border-surface-border/60 px-5 py-3 transition-all duration-200 last:border-b-0 hover:bg-surface-page/50"
                >
                  <span className="w-10 shrink-0 text-center text-xs text-ink-muted">
                    {item.display_order}
                  </span>
                  <span className="flex-1 text-sm text-ink">{item.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditModal(item)}
                    >
                      編集
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteTarget(item)}
                    >
                      削除
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))
      )}

      {/* 登録・編集モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editTarget ? "点検項目を編集" : "点検項目を新規登録"}
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
              {formError}
            </div>
          )}
          <Input
            label="設備カテゴリ"
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v })}
            placeholder="消火器具・自動火災報知設備など"
            required
          />
          <Input
            label="点検内容"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
          />
          <Input
            label="表示順"
            type="number"
            value={form.display_order}
            onChange={(v) => setForm({ ...form, display_order: v })}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="点検項目を削除"
        message={`「${deleteTarget?.name ?? ""}」を無効化します。よろしいですか？`}
        confirmLabel="削除する"
        isDanger
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ItemsPage;
