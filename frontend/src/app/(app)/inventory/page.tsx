// 在庫入出庫画面
"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import type { ProductResponse, InventoryTransactionResponse, InventoryHistoryResponse } from "@/types";

const InventoryPage = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [history, setHistory] = useState<InventoryTransactionResponse[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // フィルター
  const [filterProductId, setFilterProductId] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // 入庫フォーム
  const [inProductId, setInProductId] = useState("");
  const [inQuantity, setInQuantity] = useState("");
  const [inNote, setInNote] = useState("");
  const [inError, setInError] = useState("");
  const [isInSubmitting, setIsInSubmitting] = useState(false);

  // 出庫フォーム
  const [outProductId, setOutProductId] = useState("");
  const [outQuantity, setOutQuantity] = useState("");
  const [outNote, setOutNote] = useState("");
  const [outError, setOutError] = useState("");
  const [isOutSubmitting, setIsOutSubmitting] = useState(false);

  useEffect(() => {
    api.get<{ items: ProductResponse[] }>("/api/v1/products/?size=100").then(({ data }) => {
      setProducts(data.items);
    });
  }, []);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), size: "20" });
      if (filterProductId) params.set("product_id", filterProductId);
      if (filterType) params.set("type", filterType);
      if (filterDateFrom) params.set("date_from", filterDateFrom);
      if (filterDateTo) params.set("date_to", filterDateTo);
      const { data } = await api.get<InventoryHistoryResponse>(`/api/v1/inventory/history?${params}`);
      setHistory(data.items);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error("履歴取得エラー:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, filterProductId, filterType, filterDateFrom, filterDateTo]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleIn = async () => {
    setInError("");
    if (!inProductId || !inQuantity) {
      setInError("商品と数量は必須です");
      return;
    }
    setIsInSubmitting(true);
    try {
      await api.post("/api/v1/inventory/in", {
        product_id: Number(inProductId),
        quantity: Number(inQuantity),
        note: inNote || null,
      });
      setInProductId(""); setInQuantity(""); setInNote("");
      fetchHistory();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "入庫登録に失敗しました";
      setInError(msg);
    } finally {
      setIsInSubmitting(false);
    }
  };

  const handleOut = async () => {
    setOutError("");
    if (!outProductId || !outQuantity) {
      setOutError("商品と数量は必須です");
      return;
    }
    setIsOutSubmitting(true);
    try {
      await api.post("/api/v1/inventory/out", {
        product_id: Number(outProductId),
        quantity: Number(outQuantity),
        note: outNote || null,
      });
      setOutProductId(""); setOutQuantity(""); setOutNote("");
      fetchHistory();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "出庫登録に失敗しました";
      setOutError(msg);
    } finally {
      setIsOutSubmitting(false);
    }
  };

  const columns = [
    {
      key: "created_at",
      label: "日時",
      render: (row: InventoryTransactionResponse) =>
        new Date(row.created_at).toLocaleString("ja-JP"),
    },
    {
      key: "product_id",
      label: "商品",
      render: (row: InventoryTransactionResponse) =>
        products.find((p) => p.id === row.product_id)?.name ?? `ID:${row.product_id}`,
    },
    {
      key: "type",
      label: "種別",
      render: (row: InventoryTransactionResponse) => (
        <Badge variant={row.type === "IN" ? "info" : "danger"}>
          {row.type === "IN" ? "入庫" : "出庫"}
        </Badge>
      ),
    },
    { key: "quantity", label: "数量" },
    { key: "note", label: "備考", render: (row: InventoryTransactionResponse) => row.note ?? "—" },
    {
      key: "user",
      label: "担当者",
      render: (row: InventoryTransactionResponse) => row.user?.name ?? "—",
    },
  ];

  const SelectBox = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-md bg-background-tertiary border border-background-tertiary text-text-primary outline-none focus:border-accent transition-all duration-200 text-sm"
    >
      <option value="">{placeholder}</option>
      {products.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
    </select>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary">入出庫登録 ({total}件)</h2>

      {/* 入庫・出庫フォーム横並び */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 入庫フォーム */}
        <div className="bg-background-secondary border border-background-tertiary rounded-xl p-5 space-y-4">
          <h3 className="font-medium text-accent">入庫登録</h3>
          {inError && (
            <div className="px-3 py-2 bg-status-danger/10 border border-status-danger/30 rounded text-status-danger text-sm">{inError}</div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">商品 <span className="text-status-danger">*</span></label>
            <SelectBox value={inProductId} onChange={setInProductId} placeholder="商品を選択" />
          </div>
          <Input label="数量" type="number" value={inQuantity} onChange={setInQuantity} required />
          <Input label="備考" value={inNote} onChange={setInNote} placeholder="任意" />
          <Button onClick={handleIn} disabled={isInSubmitting} className="w-full">
            {isInSubmitting ? "登録中..." : "入庫を登録"}
          </Button>
        </div>

        {/* 出庫フォーム */}
        <div className="bg-background-secondary border border-background-tertiary rounded-xl p-5 space-y-4">
          <h3 className="font-medium text-status-danger">出庫登録</h3>
          {outError && (
            <div className="px-3 py-2 bg-status-danger/10 border border-status-danger/30 rounded text-status-danger text-sm">{outError}</div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">商品 <span className="text-status-danger">*</span></label>
            <SelectBox value={outProductId} onChange={setOutProductId} placeholder="商品を選択" />
          </div>
          <Input label="数量" type="number" value={outQuantity} onChange={setOutQuantity} required />
          <Input label="備考" value={outNote} onChange={setOutNote} placeholder="任意" />
          <Button variant="danger" onClick={handleOut} disabled={isOutSubmitting} className="w-full">
            {isOutSubmitting ? "登録中..." : "出庫を登録"}
          </Button>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex gap-3 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">商品</label>
          <select
            value={filterProductId}
            onChange={(e) => { setFilterProductId(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-md bg-background-secondary border border-background-tertiary text-text-primary outline-none focus:border-accent transition-all duration-200 text-sm"
          >
            <option value="">全商品</option>
            {products.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">種別</label>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-md bg-background-secondary border border-background-tertiary text-text-primary outline-none focus:border-accent transition-all duration-200 text-sm"
          >
            <option value="">全種別</option>
            <option value="IN">入庫</option>
            <option value="OUT">出庫</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">開始日</label>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => { setFilterDateFrom(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-md bg-background-secondary border border-background-tertiary text-text-primary outline-none focus:border-accent transition-all duration-200 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">終了日</label>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => { setFilterDateTo(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-md bg-background-secondary border border-background-tertiary text-text-primary outline-none focus:border-accent transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {/* 履歴テーブル */}
      <Table
        columns={columns as Parameters<typeof Table>[0]["columns"]}
        data={history as Record<string, unknown>[]}
        page={page}
        pages={pages}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="履歴がありません"
      />
    </div>
  );
};

export default InventoryPage;
