// アラートバナーコンポーネント
"use client";

type AlertBannerProps = {
  count: number;
};

const AlertBanner = ({ count }: AlertBannerProps) => {
  if (count === 0) return null;

  return (
    <div className="bg-status-danger/10 border border-status-danger/30 rounded-lg px-4 py-3 flex items-center gap-3">
      <span className="text-status-danger text-xl">⚠</span>
      <span className="text-status-danger font-medium">
        在庫アラート: {count}件の商品が閾値以下です。
        <a href="/alerts" className="underline ml-2 hover:opacity-80 transition-opacity duration-200">
          アラート一覧を確認
        </a>
      </span>
    </div>
  );
};

export default AlertBanner;
