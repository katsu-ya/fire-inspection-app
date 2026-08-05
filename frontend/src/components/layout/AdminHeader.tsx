// 管理者向けヘッダー（ページタイトル・ユーザー名・ログアウト）
"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";

// パスの前方一致でページタイトルを決める（定義順に評価）
const PAGE_TITLES: Array<{ prefix: string; title: string }> = [
  { prefix: "/admin/dashboard", title: "ダッシュボード" },
  { prefix: "/admin/routes", title: "ルート設定" },
  { prefix: "/admin/staff", title: "職員マスタ" },
  { prefix: "/admin/sites", title: "現場マスタ" },
  { prefix: "/admin/items", title: "点検項目マスタ" },
  { prefix: "/admin/daily-reports", title: "日報一覧" },
  { prefix: "/admin/reports", title: "点検報告詳細" },
];

const AdminHeader = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const title =
    PAGE_TITLES.find((t) => pathname.startsWith(t.prefix))?.title ?? "管理画面";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-border bg-surface-card px-6">
      <h1 className="text-lg font-bold text-ink">{title}</h1>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-ink-secondary">
            {user.name} <span className="text-ink-muted">（管理者）</span>
          </span>
        )}
        <Button variant="secondary" size="sm" onClick={() => logout()}>
          ログアウト
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
