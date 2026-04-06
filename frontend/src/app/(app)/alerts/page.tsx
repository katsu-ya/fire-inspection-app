// アラート一覧画面
"use client";

import { useAlert } from "@/hooks/useAlert";
import Link from "next/link";

const AlertsPage = () => {
  const { alerts, isLoading } = useAlert();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary">在庫アラート ({alerts.length}件)</h2>

      {isLoading ? (
        <p className="text-text-muted">読み込み中...</p>
      ) : alerts.length === 0 ? (
        <div className="bg-background-secondary border border-background-tertiary rounded-xl p-8 text-center">
          <p className="text-status-success text-lg font-medium mb-2">✓ アラートなし</p>
          <p className="text-text-muted text-sm">すべての商品が正常な在庫水準です</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const diff = alert.min_stock_alert - alert.current_stock;
            return (
              <div
                key={alert.id}
                className="bg-background-secondary border border-status-danger/30 rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <Link
                    href="/products"
                    className="text-text-primary font-medium hover:text-accent transition-colors duration-200"
                  >
                    {alert.name}
                  </Link>
                  <div className="flex gap-4 mt-1 text-sm">
                    <span className="text-text-muted">SKU: {alert.sku}</span>
                    {alert.category && (
                      <span className="text-text-muted">カテゴリ: {alert.category.name}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-status-danger font-bold text-xl">{alert.current_stock}</p>
                  <p className="text-text-muted text-xs">
                    閾値 {alert.min_stock_alert} より{" "}
                    <span className="text-status-danger font-medium">{diff}</span> 少ない
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
