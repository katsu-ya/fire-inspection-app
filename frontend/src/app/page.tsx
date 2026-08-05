// ルートページ: ロールに応じて /admin/dashboard か /me/route へリダイレクトする
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth";
import { homePathForRole } from "@/hooks/useAuth";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      router.replace(homePathForRole(user.role));
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-ink-muted">
      読み込み中...
    </div>
  );
};

export default Home;
