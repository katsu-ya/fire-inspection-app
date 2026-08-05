// axiosインスタンス設定（ベースURL・インターセプター）
import axios, { type InternalAxiosRequestConfig } from "axios";
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "./auth";
import type { RefreshResponse } from "@/types";

// APIのベースURL（環境変数未設定時はローカルのバックエンドを指す）
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// リクエストインターセプター: Authorizationヘッダーを自動付与する
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// リトライフラグ付きのリクエスト設定
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// リフレッシュ中フラグ（二重リフレッシュ防止）
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

// リフレッシュ完了後に待機中のリクエストを再開する
const processQueue = (error: unknown, token: string | null): void => {
  failedQueue.forEach((prom) => {
    if (error !== null || token === null) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ログイン画面へ遷移する（ブラウザ環境のみ）
const redirectToLogin = (): void => {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

// レスポンスインターセプター: 401エラー時にトークンリフレッシュを試みる
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetriableConfig;
    const url = originalRequest.url ?? "";
    // ログイン・リフレッシュ自身の401はリトライしない
    const isAuthPath =
      url.includes("/auth/login") || url.includes("/auth/refresh");

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthPath
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // リフレッシュ中の場合はキューに追加して完了を待つ
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      clearAuth();
      redirectToLogin();
      return Promise.reject(error);
    }

    try {
      // インターセプターを通さない素のaxiosでリフレッシュする
      const response = await axios.post<RefreshResponse>(
        `${BASE_URL}/api/v1/auth/refresh`,
        { refresh_token: refreshToken }
      );
      const newAccessToken = response.data.access_token;
      setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuth();
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// APIエラーから日本語メッセージ（detail）を型安全に取り出す
export const getApiErrorMessage = (
  error: unknown,
  fallback = "エラーが発生しました"
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: unknown } | undefined;
    if (data && typeof data.detail === "string" && data.detail.length > 0) {
      return data.detail;
    }
  }
  return fallback;
};

export default api;
