// ログイン画面
"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "ログインに失敗しました";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background-secondary border border-background-tertiary rounded-xl p-8 shadow-2xl">
        {/* タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-accent mb-1">在庫管理システム</h1>
          <p className="text-text-muted text-sm">アカウントにログイン</p>
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
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2"
          >
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
