// ヘッダーコンポーネント（ユーザー情報・ログアウト）
"use client";

import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-background-secondary border-b border-background-tertiary flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-text-secondary text-sm">
            {user.name}
            <span className="text-text-muted ml-2">({user.email})</span>
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={logout}>
          ログアウト
        </Button>
      </div>
    </header>
  );
};

export default Header;
