// ダッシュボード画面
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { useAlert } from "@/hooks/useAlert";
import AlertBanner from "@/components/ui/AlertBanner";
import type { DashboardSummary, CategoryStock, DailyMovement, TrendDataPoint, ProductResponse } from "@/types";

// rechartsをSSR無効でdynamic importする
const StockTrendChart = dynamic(() => import("@/features/dashboard/StockTrendChart"), { ssr: false });
const CategoryPieChart = dynamic(() => import("@/features/dashboard/CategoryPieChart"), { ssr: false });
const DailyMovementChart = dynamic(() => import("@/features/dashboard/DailyMovementChart"), { ssr: false });

type SummaryCard = {
  label: string;
  value: string | number;
  color: string;
};

const DashboardPage = () => {
  const { alerts } = useAlert();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categoryStock, setCategoryStock] = useState<CategoryStock[]>([]);
  const [dailyMovement, setDailyMovement] = useState<DailyMovement[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [firstProduct, setFirstProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, categoryRes, dailyRes, productsRes] = await Promise.all([
          api.get<DashboardSummary>("/api/v1/reports/summary"),
          api.get<CategoryStock[]>("/api/v1/reports/category-stock"),
          api.get<DailyMovement[]>("/api/v1/reports/daily-movement"),
          api.get("/api/v1/products/?page=1&size=1"),
        ]);
        setSummary(summaryRes.data);
        setCategoryStock(categoryRes.data);
        setDailyMovement(dailyRes.data);

        // 在庫推移グラフ用に最初の商品を使用
        const product = productsRes.data.items?.[0];
        if (product) {
          setFirstProduct(product);
          const trendRes = await api.get<TrendDataPoint[]>(`/api/v1/reports/trend?product_id=${product.id}`);
          setTrendData(trendRes.data);
        }
      } catch (err) {
        console.error("ダッシュボードデータ取得エラー:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const summaryCards: SummaryCard[] = [
    { label: "総商品数", value: summary?.total_products ?? "-", color: "text-accent" },
    { label: "総在庫数", value: summary?.total_stock ?? "-", color: "text-status-success" },
    { label: "アラート件数", value: summary?.alert_count ?? "-", color: "text-status-danger" },
    { label: "直近の入出庫", value: summary?.recent_transactions ?? "-", color: "text-status-warning" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary">ダッシュボード</h2>

      {/* アラートバナー */}
      <AlertBanner count={alerts.length} />

      {/* サマリーカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-background-secondary border border-background-tertiary rounded-xl p-5"
          >
            <p className="text-text-secondary text-sm mb-2">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color}`}>
              {isLoading ? "..." : card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 在庫推移折れ線グラフ */}
        <div className="bg-background-secondary border border-background-tertiary rounded-xl p-5">
          <h3 className="text-text-primary font-medium mb-4">
            在庫推移（直近30日）
            {firstProduct && (
              <span className="text-text-muted text-sm ml-2">— {firstProduct.name}</span>
            )}
          </h3>
          <StockTrendChart data={trendData} />
        </div>

        {/* カテゴリ別在庫割合 */}
        <div className="bg-background-secondary border border-background-tertiary rounded-xl p-5">
          <h3 className="text-text-primary font-medium mb-4">カテゴリ別在庫割合</h3>
          <CategoryPieChart data={categoryStock} />
        </div>
      </div>

      {/* 日別入出庫棒グラフ */}
      <div className="bg-background-secondary border border-background-tertiary rounded-xl p-5">
        <h3 className="text-text-primary font-medium mb-4">日別入出庫（直近7日）</h3>
        <DailyMovementChart data={dailyMovement} />
      </div>
    </div>
  );
};

export default DashboardPage;
