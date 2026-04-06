// レポート用在庫推移グラフ（複数商品比較）
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { TrendDataPoint, ProductResponse } from "@/types";

type Props = {
  dataMap: Record<number, TrendDataPoint[]>;
  products: ProductResponse[];
};

// 商品ごとのカラーパレット
const COLORS = ["#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const ReportTrendChart = ({ dataMap, products }: Props) => {
  if (products.length === 0 || Object.keys(dataMap).length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-text-muted text-sm">
        商品を選択してください
      </div>
    );
  }

  // 全商品のdateをマージして統一データセットを作成する
  const dateSet = new Set<string>();
  Object.values(dataMap).forEach((points) => {
    points.forEach((p) => dateSet.add(p.date));
  });
  const allDates = Array.from(dateSet).sort();

  const mergedData = allDates.map((date) => {
    const entry: Record<string, string | number> = { date };
    products.forEach((product) => {
      const point = dataMap[product.id]?.find((p) => p.date === date);
      entry[`product_${product.id}`] = point?.net_change ?? 0;
    });
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={mergedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
          labelStyle={{ color: "#f1f5f9" }}
        />
        <Legend wrapperStyle={{ color: "#94a3b8" }} />
        {products.map((product, idx) => (
          <Line
            key={product.id}
            type="monotone"
            dataKey={`product_${product.id}`}
            name={product.name}
            stroke={COLORS[idx % COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ReportTrendChart;
