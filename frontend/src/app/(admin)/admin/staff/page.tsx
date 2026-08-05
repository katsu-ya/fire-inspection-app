// 職員マスタ画面: 一覧・登録・編集・論理削除
"use client";

import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import type { Role, User } from "@/types";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

// フォームの入力値
type StaffForm = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

const EMPTY_FORM: StaffForm = {
  name: "",
  email: "",
  password: "",
  role: "EMPLOYEE",
};

const StaffPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // モーダル状態（editTarget=nullなら新規登録）
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [form, setForm] = useState<StaffForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 削除確認状態
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 職員一覧を取得する
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data } = await api.get<User[]>("/api/v1/admin/users");
      setUsers(data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "職員一覧の取得に失敗しました"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 新規登録モーダルを開く
  const openCreateModal = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setIsModalOpen(true);
  };

  // 編集モーダルを開く
  const openEditModal = (user: User) => {
    setEditTarget(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setFormError("");
    setIsModalOpen(true);
  };

  // 登録・更新を実行する
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFormError("");
    try {
      if (editTarget) {
        // 編集時はパスワードが空欄なら変更しない
        const body: Record<string, string> = {
          name: form.name,
          email: form.email,
          role: form.role,
        };
        if (form.password) {
          body.password = form.password;
        }
        await api.put(`/api/v1/admin/users/${editTarget.id}`, body);
      } else {
        await api.post("/api/v1/admin/users", {
          email: form.email,
          password: form.password,
          name: form.name,
          role: form.role,
        });
      }
      setIsModalOpen(false);
      await fetchUsers();
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
      await api.delete(`/api/v1/admin/users/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchUsers();
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
        title="職員一覧"
        action={<Button onClick={openCreateModal}>新規登録</Button>}
        noPadding
      >
        <Table<User>
          columns={[
            { key: "name", label: "名前" },
            { key: "email", label: "メールアドレス" },
            {
              key: "role",
              label: "ロール",
              render: (row) =>
                row.role === "ADMIN" ? (
                  <Badge variant="info">管理者</Badge>
                ) : (
                  <Badge variant="gray">従業員</Badge>
                ),
            },
            {
              key: "is_active",
              label: "状態",
              render: (row) =>
                row.is_active ? (
                  <Badge variant="success">有効</Badge>
                ) : (
                  <Badge variant="danger">無効</Badge>
                ),
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
          data={users}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="職員が登録されていません"
        />
      </Card>

      {/* 登録・編集モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editTarget ? "職員を編集" : "職員を新規登録"}
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
              {formError}
            </div>
          )}
          <Input
            label="名前"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
          />
          <Input
            label="メールアドレス"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            required
          />
          <Input
            label="パスワード"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            placeholder={editTarget ? "変更する場合のみ入力" : "パスワードを入力"}
            required={!editTarget}
          />
          <Select
            label="ロール"
            value={form.role}
            onChange={(v) => setForm({ ...form, role: v as Role })}
            options={[
              { value: "EMPLOYEE", label: "従業員" },
              { value: "ADMIN", label: "管理者" },
            ]}
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
        title="職員を削除"
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

export default StaffPage;
