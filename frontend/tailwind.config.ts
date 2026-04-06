import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#0f172a",   // メイン背景
          secondary: "#1e293b", // カード・サイドバー背景
          tertiary: "#334155",  // ホバー・ボーダー
        },
        accent: {
          DEFAULT: "#06b6d4",   // シアン（メインアクセント）
          hover: "#0891b2",
          muted: "#164e63",
        },
        text: {
          primary: "#f1f5f9",
          secondary: "#94a3b8",
          muted: "#64748b",  // 可読性向上のため少し明るく調整
        },
        status: {
          danger: "#ef4444",
          warning: "#f59e0b",
          success: "#10b981",
        },
      },
    },
  },
  plugins: [],
};

export default config;
