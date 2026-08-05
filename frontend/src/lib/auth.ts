// 認証情報（トークン・ユーザー情報）のlocalStorage管理
import type { User } from "@/types";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

// ブラウザ環境かどうか判定する（SSR時はlocalStorageが存在しない）
const isBrowser = (): boolean => typeof window !== "undefined";

// アクセストークンを保存する
export const setAccessToken = (token: string): void => {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

// アクセストークンを取得する
export const getAccessToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// リフレッシュトークンを保存する
export const setRefreshToken = (token: string): void => {
  if (!isBrowser()) return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

// リフレッシュトークンを取得する
export const getRefreshToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// ユーザー情報を保存する
export const setStoredUser = (user: User): void => {
  if (!isBrowser()) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// ユーザー情報を取得する（壊れたJSONはnull扱い）
export const getStoredUser = (): User | null => {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

// 認証情報をすべて削除する
export const clearAuth = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
