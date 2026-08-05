// 直近7日の点検実施状況グラフ（縦棒: 予定=薄青 / 完了=青）
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { WeeklyPoint } from "@/types";
import { formatDateLabel, formatShortDate } from "@/lib/format";

type WeeklyBarChartProps = {
  data: WeeklyPoint[];
};

const WeeklyBarChart = ({ data }: WeeklyBarChartProps) => {
  // データがない場合は空状態を表示する
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-ink-muted">
        データがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={2}>
        {/* グリッドは横線のみ・控えめな色 */}
        <CartesianGrid stroke="#e1e0d9" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => formatShortDate(value)}
          tick={{ fill: "#898781", fontSize: 12 }}
          axisLine={{ stroke: "#e1e0d9" }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "#898781", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          labelFormatter={(label) => formatDateLabel(String(label))}
          cursor={{ fill: "rgba(42, 120, 214, 0.06)" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {/* 予定（薄青）・完了（青）の2系列。棒の先端は丸める */}
        <Bar dataKey="planned" name="予定" fill="#9ec5f4" radius={[4, 4, 0, 0]} />
        <Bar dataKey="completed" name="完了" fill="#2a78d6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklyBarChart;
