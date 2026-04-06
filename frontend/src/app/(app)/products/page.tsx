// 商品一覧画面
"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import type { ProductResponse, ProductListResponse, CategoryResponse, ProductCreate, ProductUpdate } from "@/types";

// 在庫数に応じたバッジバリアントを返す
const getStockBadgeVariant = (stock: number, minAlert: number) => {
  if (stock <= minAlert) return "danger";
  if (stock <= minAlert * 1.5) return "warning";
  return "success";
};

type ProductFormData = {
  name: string;
  sku: string;
  category_id: string;
  unit_price: string;
  current_stock: string;
  min_stock_alert: string;
};

const emptyForm: ProductFormData = {
  name: "", sku: "", category_id: "", unit_price: "", current_stock: "0", min_stock_alert: "0",
};

const ProductsPage = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // モーダル制御
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductResponse | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 削除確認ダイアログ
  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: "20",
      });
      if (keyword) params.set("keyword", keyword);
      if (categoryFilter) params.set("category_id", categoryFilter);
      const { data } = await api.get<ProductListResponse>(`/api/v1/products/?${params}`);
      setProducts(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error("商品一覧取得エラー:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, keyword, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get<CategoryResponse[]>("/api/v1/categories/").then(({ data }) => setCategories(data));
  }, []);

  // ソート処理
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // クライアントサイドソート
  const sortedProducts = [...products].sort((a, b) => {
    const aVal = String(a[sortKey as keyof ProductResponse] ?? "");
    const bVal = String(b[sortKey as keyof ProductResponse] ?? "");
    return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const openCreateModal = () => {
    setEditTarget(null);
    setFormData(emptyForm);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductResponse) => {
    setEditTarget(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id ? String(product.category_id) : "",
      unit_price: product.unit_price,
      current_stock: String(product.current_stock),
      min_stock_alert: String(product.min_stock_alert),
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setFormError("");
    setIsSubmitting(true);
    try {
      if (editTarget) {
        const payload: ProductUpdate = {
          name: formData.name,
          sku: formData.sku,
          category_id: formData.category_id ? Number(formData.category_id) : null,
          unit_price: Number(formData.unit_price),
          min_stock_alert: Number(formData.min_stock_alert),
        };
        await api.put(`/api/v1/products/${editTarget.id}`, payload);
      } else {
        const payload: ProductCreate = {
          name: formData.name,
          sku: formData.sku,
          category_id: formData.category_id ? Number(formData.category_id) : null,
          unit_price: Number(formData.unit_price),
          current_stock: Number(formData.current_stock),
          min_stock_alert: Number(formData.min_stock_alert),
        };
        await api.post("/api/v1/products/", payload);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "保存に失敗しました";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/v1/products/${deleteTarget.id}`);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      console.error("削除エラー:", err);
    }
  };

  const columns = [
    { key: "name", label: "商品名", sortable: true },
    { key: "sku", label: "SKU", sortable: true },
    {
      key: "category",
      label: "カテゴリ",
      render: (row: ProductResponse) => row.category?.name ?? "—",
    },
    {
      key: "current_stock",
      label: "在庫数",
      sortable: true,
      render: (row: ProductResponse) => (
        <Badge variant={getStockBadgeVariant(row.current_stock, row.min_stock_alert)}>
          {row.current_stock}
        </Badge>
      ),
    },
    { key: "unit_price", label: "単価", sortable: true, render: (row: ProductResponse) => `¥${Number(row.unit_price).toLocaleString()}` },
    {
      key: "actions",
      label: "操作",
      render: (row: ProductResponse) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => openEditModal(row)}>編集</Button>
          <Button variant="danger" size="sm" onClick={() => { setDeleteTarget(row); setIsDeleteModalOpen(true); }}>削除</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">商品管理 ({total}件)</h2>
        <Button onClick={openCreateModal}>+ 新規登録</Button>
      </div>

      {/* 検索・フィルター */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          placeholder="商品名・SKUで検索"
          className="px-3 py-2 rounded-md bg-background-secondary border border-background-tertiary text-text-primary placeholder-text-muted outline-none focus:border-accent transition-all duration-200 text-sm w-56"
        />
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-md bg-background-secondary border border-background-tertiary text-text-primary outline-none focus:border-accent transition-all duration-200 text-sm"
        >
          <option value="">全カテゴリ</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>
      </div>

      <Table
        columns={columns as Parameters<typeof Table>[0]["columns"]}
        data={sortedProducts as Record<string, unknown>[]}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        page={page}
        pages={pages}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="商品が見つかりません"
      />

      {/* 新規登録・編集モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editTarget ? "商品を編集" : "商品を新規登録"}
        size="md"
      >
        <div className="space-y-4">
          {formError && (
            <div className="px-4 py-3 bg-status-danger/10 border border-status-danger/30 rounded-lg text-status-danger text-sm">
              {formError}
            </div>
          )}
          <Input label="商品名" value={formData.name} onChange={(v) => setFormData((p) => ({ ...p, name: v }))} required />
          <Input label="SKU" value={formData.sku} onChange={(v) => setFormData((p) => ({ ...p, sku: v }))} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">カテゴリ</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData((p) => ({ ...p, category_id: e.target.value }))}
              className="px-3 py-2 rounded-md bg-background-tertiary border border-background-tertiary text-text-primary outline-none focus:border-accent transition-all duration-200 text-sm"
            >
              <option value="">未設定</option>
              {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </div>
          <Input label="単価" type="number" value={formData.unit_price} onChange={(v) => setFormData((p) => ({ ...p, unit_price: v }))} required />
          {!editTarget && (
            <Input label="初期在庫数" type="number" value={formData.current_stock} onChange={(v) => setFormData((p) => ({ ...p, current_stock: v }))} />
          )}
          <Input label="アラート閾値" type="number" value={formData.min_stock_alert} onChange={(v) => setFormData((p) => ({ ...p, min_stock_alert: v }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>キャンセル</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="商品を削除"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            「{deleteTarget?.name}」を削除しますか？この操作は取り消せません。
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>キャンセル</Button>
            <Button variant="danger" onClick={handleDelete}>削除する</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsPage;
