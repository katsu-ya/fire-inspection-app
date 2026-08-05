import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

// 日本語フォント（Noto Sans JP）
const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "消防保守点検システム",
  description: "消防設備の保守点検業務を管理するシステム",
};

// ルートレイアウト
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <body className={`${notoSansJp.className} bg-surface-page text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
