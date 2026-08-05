// 管理者向けレイアウト（サイドバー+ヘッダー、ADMINロールガード付き）
"use client";

import { useRequireRole } from "@/hooks/useAuth";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAllowed } = useRequireRole("ADMIN");

  // 認証確認中・リダイレクト中は画面を表示しない
  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-muted">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <div className="ml-60">
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
