// 日別入出庫棒グラフ（recharts）
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { DailyMovement } from "@/types";

type Props = {
  data: DailyMovement[];
};

const DailyMovementChart = ({ data }: Props) => {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-text-muted text-sm">
        データがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
          labelStyle={{ color: "#f1f5f9" }}
        />
        <Legend wrapperStyle={{ color: "#94a3b8" }} />
        {/* 入庫: シアン */}
        <Bar dataKey="in_quantity" name="入庫" fill="#06b6d4" radius={[4, 4, 0, 0]} />
        {/* 出庫: コーラル */}
        <Bar dataKey="out_quantity" name="出庫" fill="#f87171" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyMovementChart;
