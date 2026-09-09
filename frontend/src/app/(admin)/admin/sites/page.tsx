// 現場マスタ画面: キーワード検索付き一覧・登録・編集・論理削除
"use client";

import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
//import type { Site, SiteRequest } from "@/types";
import type { Site, SiteRequest, EquipmentCategory } from "@/types";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

// フォームの空値
const EMPTY_FORM: SiteRequest = {
  name: "",
  address: "",
  building_type: "",
  contact_name: "",
  contact_phone: "",
  note: "",
  equipment_category_ids: [],
};

const SitesPage = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // モーダル状態（editTarget=nullなら新規登録）
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Site | null>(null);
  const [form, setForm] = useState<SiteRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 削除確認状態
  const [deleteTarget, setDeleteTarget] = useState<Site | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 現場一覧を取得する（keywordで部分一致検索）
  const fetchSites = useCallback(async (searchKeyword: string) => {
    setIsLoading(true);
    setError("");
    try {
      const { data } = await api.get<Site[]>("/api/v1/admin/sites", {
        params: searchKeyword ? { keyword: searchKeyword } : {},
      });
      setSites(data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "現場一覧の取得に失敗しました"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
       const { data } = await api.get<EquipmentCategory[]>(
          "/api/v1/admin/equipment-categories"
          );
          setCategories(data);
        } catch (err: unknown) {
          setError(getApiErrorMessage(err, "設備カテゴリの取得に失敗しました"));
        }
    }, []);

  useEffect(() => {
      fetchSites("");
      fetchCategories();
  }, [fetchSites, fetchCategories]);

  // 新規登録モーダルを開く
  const openCreateModal = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setIsModalOpen(true);
  };

  // 編集モーダルを開く
  const openEditModal = (site: Site) => {
    setEditTarget(site);
    setForm({
      name: site.name,
      address: site.address ?? "",
      building_type: site.building_type ?? "",
      contact_name: site.contact_name ?? "",
      contact_phone: site.contact_phone ?? "",
      note: site.note ?? "",
      equipment_category_ids: site.equipment_categories.map((c) => c.id),
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // 登録・更新を実行する
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFormError("");
    try {
      if (editTarget) {
        await api.put(`/api/v1/admin/sites/${editTarget.id}`, form);
      } else {
        await api.post("/api/v1/admin/sites", form);
      }
      setIsModalOpen(false);
      await fetchSites(keyword);
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
      await api.delete(`/api/v1/admin/sites/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchSites(keyword);
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

      <Card
        title="現場一覧"
        action={<Button onClick={openCreateModal}>新規登録</Button>}
        noPadding
      >
        {/* キーワード検索 */}
        <div className="flex gap-2 border-b border-surface-border p-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                fetchSites(keyword);
              }
            }}
            placeholder="現場名・住所で検索"
            className="w-72 rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-ink placeholder-ink-muted outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand-light"
          />
          <Button variant="secondary" onClick={() => fetchSites(keyword)}>
            検索
          </Button>
        </div>

        <Table<Site>
          columns={[
            { key: "name", label: "現場名" },
            {
              key: "address",
              label: "住所",
              render: (row) => row.address ?? "-",
            },
            {
              key: "building_type",
              label: "建物用途",
              render: (row) => row.building_type ?? "-",
            },
            {
              key: "contact_name",
              label: "担当者",
              render: (row) => row.contact_name ?? "-",
            },
            {
              key: "contact_phone",
              label: "電話",
              render: (row) => row.contact_phone ?? "-",
            },
            {
              key: "actions",
              label: "操作",
              className: "w-40",
              render: (row) => (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditModal(row)}
                  >
                    編集
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(row)}
                    disabled={!row.is_active}
                  >
                    削除
                  </Button>
                </div>
              ),
            },
          ]}
          data={sites}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="現場が登録されていません"
        />
      </Card>

      {/* 登録・編集モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editTarget ? "現場を編集" : "現場を新規登録"}
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
              {formError}
            </div>
          )}
          <Input
            label="現場名（建物名）"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
          />
          <Input
            label="住所"
            value={form.address}
            onChange={(v) => setForm({ ...form, address: v })}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="建物用途"
              value={form.building_type}
              onChange={(v) => setForm({ ...form, building_type: v })}
              placeholder="事務所・共同住宅など"
            />
            <Input
              label="現場担当者名"
              value={form.contact_name}
              onChange={(v) => setForm({ ...form, contact_name: v })}
            />
            <Input
              label="連絡先電話番号"
              value={form.contact_phone}
              onChange={(v) => setForm({ ...form, contact_phone: v })}
            />
          </div>
          <Textarea
            label="備考（入館方法など）"
            value={form.note}
            onChange={(v) => setForm({ ...form, note: v })}
            rows={3}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-secondary">
              設備カテゴリ
              <span className="text-status-danger ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-surface-border p-4 sm:grid-cols-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 text-sm text-ink"
                >
                  <input
                  type="checkbox"
                    checked={form.equipment_category_ids.includes(category.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm({
                        ...form,
                        equipment_category_ids: [
                        ...form.equipment_category_ids,
                        category.id,
                      ],
                        });
                      } else {
                      setForm({
                      ...form,
                      equipment_category_ids: form.equipment_category_ids.filter(
                       (id) => id !== category.id
                        ),
                      });
                    }
                  }}
                  />
                  {category.name}
               </label>
              ))}
            </div>
          </div>

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
        title="現場を削除"
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

export default SitesPage;
