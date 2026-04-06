// 認証状態のグローバル管理フック
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { clearTokens, getAccessToken, setAccessToken, setRefreshToken } from "@/lib/auth";
import type { UserResponse } from "@/types";

type AuthState = {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export const useAuth = () => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // 現在のユーザー情報を取得する
  const fetchCurrentUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const { data } = await api.get<UserResponse>("/api/v1/auth/me");
      setState({ user: data, isLoading: false, isAuthenticated: true });
    } catch {
      clearTokens();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // ログイン処理
  const login = async (email: string, password: string) => {
    const { data } = await api.post("/api/v1/auth/login", { email, password });
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
    const { data: user } = await api.get<UserResponse>("/api/v1/auth/me");
    setState({ user, isLoading: false, isAuthenticated: true });
    router.push("/dashboard");
  };

  // ログアウト処理
  const logout = async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch {
      // ログアウトAPIが失敗してもローカルトークンは削除する
    } finally {
      clearTokens();
      setState({ user: null, isLoading: false, isAuthenticated: false });
      router.push("/login");
    }
  };

  return { ...state, login, logout };
};
