// 不良指摘の設備カテゴリ別件数グラフ（横棒・単一系列・件数を直接ラベル表示）
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import type { FailCategoryCount } from "@/types";

type FailCategoryChartProps = {
  data: FailCategoryCount[];
};

const FailCategoryChart = ({ data }: FailCategoryChartProps) => {
  // データがない場合は空状態を表示する
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-ink-muted">
        データがありません
      </div>
    );
  }

  // カテゴリ数に応じて高さを調整する
  const height = Math.max(220, data.length * 44 + 40);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 36, left: 8, bottom: 0 }}
      >
        {/* 横棒グラフでは縦線のみ表示する */}
        <CartesianGrid stroke="#e1e0d9" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fill: "#898781", fontSize: 12 }}
          axisLine={{ stroke: "#e1e0d9" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="category"
          width={120}
          tick={{ fill: "#898781", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [`${value}件`, "不良件数"]}
          cursor={{ fill: "rgba(42, 120, 214, 0.06)" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />
        {/* 単一系列なので凡例は不要。件数を直接ラベル表示する */}
        <Bar dataKey="count" name="不良件数" fill="#2a78d6" radius={[0, 4, 4, 0]} barSize={20}>
          <LabelList dataKey="count" position="right" fill="#475569" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FailCategoryChart;
