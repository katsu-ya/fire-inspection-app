// レポート画面
"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import type { ProductResponse, TrendDataPoint, ReportSummaryItem } from "@/types";

// rechartsをSSR無効でdynamic importする
const ReportTrendChart = dynamic(() => import("@/features/reports/ReportTrendChart"), { ssr: false });

type Period = "7" | "30" | "90" | "custom";

const getPeriodDates = (period: Period, customFrom: string, customTo: string) => {
  if (period === "custom") {
    return { from: customFrom, to: customTo };
  }
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - Number(period));
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
};

const ReportsPage = () => {
  const [period, setPeriod] = useState<Period>("30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [trendDataMap, setTrendDataMap] = useState<Record<number, TrendDataPoint[]>>({});
  const [summaryItems, setSummaryItems] = useState<ReportSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get<{ items: ProductResponse[] }>("/api/v1/products/?size=100").then(({ data }) => {
      setProducts(data.items);
      // 最初の商品をデフォルト選択する
      if (data.items.length > 0) {
        setSelectedProductIds([data.items[0].id]);
      }
    });
  }, []);

  const fetchReportData = useCallback(async () => {
    const { from, to } = getPeriodDates(period, customFrom, customTo);
    if (!from || !to) return;

    setIsLoading(true);
    try {
      // 選択商品の在庫推移を取得する
      const trendPromises = selectedProductIds.map((id) =>
        api.get<TrendDataPoint[]>(`/api/v1/reports/trend?product_id=${id}&date_from=${from}&date_to=${to}`)
          .then(({ data }) => ({ id, data }))
      );
      const trendResults = await Promise.all(trendPromises);
      const newMap: Record<number, TrendDataPoint[]> = {};
      trendResults.forEach(({ id, data }) => { newMap[id] = data; });
      setTrendDataMap(newMap);

      // 在庫入出庫履歴から商品別サマリーを集計する
      const { data: historyData } = await api.get<{ items: import("@/types").InventoryTransactionResponse[] }>(
        `/api/v1/inventory/history?size=1000&date_from=${from}&date_to=${to}`
      );
      const productMap: Record<number, ReportSummaryItem> = {};
      historyData.items.forEach((tx) => {
        const product = products.find((p) => p.id === tx.product_id);
        if (!productMap[tx.product_id]) {
          productMap[tx.product_id] = {
            product_id: tx.product_id,
            product_name: product?.name ?? `ID:${tx.product_id}`,
            sku: product?.sku ?? "",
            total_in: 0,
            total_out: 0,
            net_change: 0,
          };
        }
        if (tx.type === "IN") {
          productMap[tx.product_id].total_in += tx.quantity;
          productMap[tx.product_id].net_change += tx.quantity;
        } else {
          productMap[tx.product_id].total_out += tx.quantity;
          productMap[tx.product_id].net_change -= tx.quantity;
        }
      });
      setSummaryItems(Object.values(productMap));
    } catch (err) {
      console.error("レポートデータ取得エラー:", err);
    } finally {
      setIsLoading(false);
    }
  }, [period, customFrom, customTo, selectedProductIds, products]);

  useEffect(() => {
    if (selectedProductIds.length > 0) {
      fetchReportData();
    }
  }, [fetchReportData]);

  const toggleProduct = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const periods: { value: Period; label: string }[] = [
    { value: "7", label: "直近7日" },
    { value: "30", label: "直近30日" },
    { value: "90", label: "直近90日" },
    { value: "custom", label: "カスタム" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary">レポート</h2>

      {/* 期間セレクター */}
      <div className="bg-background-secondary border border-background-tertiary rounded-xl p-5 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {periods.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "primary" : "secondary"}
              size="sm"
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        {period === "custom" && (
          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-2 rounded-md bg-background-tertiary border border-background-tertiary text-text-primary outline-none focus:border-accent transition-all duration-200 text-sm"
            />
            <span className="text-text-muted">〜</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-2 rounded-md bg-background-tertiary border border-background-tertiary text-text-primary outline-none focus:border-accent transition-all duration-200 text-sm"
            />
          </div>
        )}
      </div>

      {/* 商品選択（複数） */}
      <div className="bg-background-secondary border border-background-tertiary rounded-xl p-5">
        <h3 className="text-text-primary font-medium mb-3">比較する商品を選択</h3>
        <div className="flex gap-2 flex-wrap">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => toggleProduct(p.id)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium border transition-all duration-200
                ${selectedProductIds.includes(p.id)
                  ? "bg-accent text-white border-accent"
                  : "bg-background-tertiary text-text-secondary border-background-tertiary hover:border-accent"
                }
              `}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 在庫推移グラフ */}
      <div className="bg-background-secondary border border-background-tertiary rounded-xl p-5">
        <h3 className="text-text-primary font-medium mb-4">在庫推移グラフ</h3>
        {isLoading ? (
          <div className="h-48 flex items-center justify-center text-text-muted text-sm">読み込み中...</div>
        ) : (
          <ReportTrendChart
            dataMap={trendDataMap}
            products={products.filter((p) => selectedProductIds.includes(p.id))}
          />
        )}
      </div>

      {/* 入出庫サマリーテーブル */}
      <div className="bg-background-secondary border border-background-tertiary rounded-xl p-5">
        <h3 className="text-text-primary font-medium mb-4">入出庫サマリー（商品別集計）</h3>
        {summaryItems.length === 0 ? (
          <p className="text-text-muted text-sm">期間内のデータがありません</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-background-tertiary">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-background-tertiary bg-background-tertiary/30">
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">商品名</th>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">SKU</th>
                  <th className="px-4 py-3 text-right text-text-secondary font-medium">入庫合計</th>
                  <th className="px-4 py-3 text-right text-text-secondary font-medium">出庫合計</th>
                  <th className="px-4 py-3 text-right text-text-secondary font-medium">純変動</th>
                </tr>
              </thead>
              <tbody>
                {summaryItems.map((item) => (
                  <tr key={item.product_id} className="border-b border-background-tertiary/50 hover:bg-background-tertiary/20 transition-colors duration-200">
                    <td className="px-4 py-3 text-text-primary">{item.product_name}</td>
                    <td className="px-4 py-3 text-text-secondary">{item.sku}</td>
                    <td className="px-4 py-3 text-right text-accent">{item.total_in}</td>
                    <td className="px-4 py-3 text-right text-status-danger">{item.total_out}</td>
                    <td className={`px-4 py-3 text-right font-medium ${item.net_change >= 0 ? "text-status-success" : "text-status-danger"}`}>
                      {item.net_change >= 0 ? "+" : ""}{item.net_change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
