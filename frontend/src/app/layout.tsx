import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "在庫管理システム",
  description: "企業向け商品在庫管理システム",
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html lang="ja">
      <body className="bg-background-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
