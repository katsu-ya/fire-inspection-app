// ログイン画面
"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ログインフォーム送信処理
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "ログインに失敗しました"));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy via-navy-light to-brand-hover">
      <div className="w-full max-w-md bg-surface-card rounded-2xl p-8 shadow-2xl">
        {/* ロゴ・システム名 */}
        <div className="text-center mb-8">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-hover shadow-lg">
            {/* 盾+炎のアイコン */}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-9 w-9 text-white"
              aria-hidden="true"
            >
              <path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3z" />
              <path
                d="M12 7c.4 2-.4 3-1.3 4-1 1-1.9 2.1-1.9 3.7a3.2 3.2 0 006.4 0c0-1.4-.6-2.5-1.4-3.4-.2.6-.6 1-1.1 1.4.2-1.9-.6-4.3-.7-5.7z"
                fill="#dbeafe"
              />
            </svg>
          </span>
          <h1 className="text-2xl font-bold text-ink mb-1">消防保守点検システム</h1>
          <p className="text-ink-muted text-sm">アカウントにログイン</p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-status-danger/10 border border-status-danger/30 rounded-lg text-status-danger text-sm">
            {error}
          </div>
        )}

        {/* ログインフォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="メールアドレス"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="example@company.com"
            required
          />
          <Input
            label="パスワード"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="パスワードを入力"
            required
          />
          <Button type="submit" disabled={isLoading} className="w-full mt-2" size="lg">
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
