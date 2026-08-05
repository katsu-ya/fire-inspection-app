// 認証状態管理フック（ロール判定含む）
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  clearAuth,
  getRefreshToken,
  getStoredUser,
  setAccessToken,
  setRefreshToken,
  setStoredUser,
} from "@/lib/auth";
import type { LoginResponse, Role, User } from "@/types";

// ロールに応じたホームパスを返す
export const homePathForRole = (role: Role): string =>
  role === "ADMIN" ? "/admin/dashboard" : "/me/route";

// 認証状態（user）・ログイン・ログアウトを提供するフック
export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初回マウント時にlocalStorageからユーザー情報を復元する
  useEffect(() => {
    setUser(getStoredUser());
    setIsLoading(false);
  }, []);

  // ログイン処理: トークン・ユーザーを保存し、ロール別ホームへ遷移する
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const { data } = await api.post<LoginResponse>("/api/v1/auth/login", {
        email,
        password,
      });
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setStoredUser(data.user);
      setUser(data.user);
      router.push(homePathForRole(data.user.role));
    },
    [router]
  );

  // ログアウト処理: サーバー側のリフレッシュトークンを無効化し、ローカルを破棄する
  const logout = useCallback(async (): Promise<void> => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await api.post("/api/v1/auth/logout", { refresh_token: refreshToken });
      }
    } catch {
      // ログアウトAPIが失敗してもローカルの認証情報は削除する
    } finally {
      clearAuth();
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
  };
};

// 認証ガード: 未認証は /login、ロール不一致は自ロールのホームへリダイレクトする
export const useRequireRole = (role: Role) => {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== role) {
      router.replace(homePathForRole(user.role));
    }
  }, [user, isLoading, role, router]);

  return {
    user,
    isLoading,
    logout,
    // ガードを通過して表示して良いかどうか
    isAllowed: !isLoading && user !== null && user.role === role,
  };
};
