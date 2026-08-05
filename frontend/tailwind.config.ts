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
        // ブランド（青系）
        brand: {
          DEFAULT: "#1d4ed8", // メインの青（ボタン・アクティブ状態）
          hover: "#1e40af",
          light: "#dbeafe", // 選択背景・バッジ背景
          faint: "#eff6ff", // ホバー背景
        },
        // サイドバー・ヘッダー（濃紺）
        navy: {
          DEFAULT: "#0c1e3e",
          light: "#16325f",
          border: "#1e3a6e",
        },
        // 背景・ボーダー
        surface: {
          page: "#f4f7fb", // ページ背景
          card: "#ffffff", // カード背景
          border: "#e2e8f0",
        },
        // テキスト
        ink: {
          DEFAULT: "#0f172a", // 本文
          secondary: "#475569",
          muted: "#94a3b8",
        },
        // ステータス
        status: {
          success: "#059669", // 完了・良
          warning: "#d97706", // 作業中・注意
          danger: "#dc2626", // 不良・エラー
        },
        // チャート専用（CVD検証済みパレット。系列は最大3色まで）
        chart: {
          s1: "#2a78d6", // 系列1（青）
          s2: "#eb6834", // 系列2（オレンジ）
          s3: "#1baf7a", // 系列3（アクア）
          grid: "#e1e0d9",
          axis: "#898781",
        },
      },
    },
  },
  plugins: [],
};

export default config;
