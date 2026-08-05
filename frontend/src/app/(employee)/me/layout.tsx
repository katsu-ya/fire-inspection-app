// 従業員向けレイアウト（モバイル前提・上部濃紺ヘッダー+下部タブナビ、EMPLOYEEロールガード付き）
"use client";

import { useRequireRole } from "@/hooks/useAuth";
import EmployeeNav from "@/components/layout/EmployeeNav";

const EmployeeLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAllowed, logout } = useRequireRole("EMPLOYEE");

  // 認証確認中・リダイレクト中は画面を表示しない
  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-muted">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* 上部濃紺ヘッダー */}
      <header className="sticky top-0 z-40 bg-navy">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-brand to-brand-hover">
              {/* 炎のアイコン */}
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-white"
                aria-hidden="true"
              >
                <path d="M12 2c.6 3-0.6 4.6-2 6-1.6 1.6-3 3.4-3 6a7 7 0 0014 0c0-2.3-1-4-2.2-5.5-.4 1-.9 1.7-1.8 2.3.3-3-1-6.8-5-8.8z" />
              </svg>
            </span>
            <span className="text-sm font-bold text-white">消防保守点検</span>
          </div>
          <div className="flex items-center gap-3">
            {user && <span className="text-xs text-white/80">{user.name}</span>}
            <button
              onClick={() => logout()}
              className="rounded-md border border-white/30 px-2.5 py-1 text-xs text-white/90 transition-all duration-200 hover:bg-navy-light"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ（モバイル幅中央寄せ） */}
      <main className="mx-auto max-w-lg px-4 py-4">{children}</main>

      {/* 下部固定タブナビ */}
      <EmployeeNav />
    </div>
  );
};

export default EmployeeLayout;
