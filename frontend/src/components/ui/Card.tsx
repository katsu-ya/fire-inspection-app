// 汎用カードコンポーネント
"use client";

type CardProps = {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
  className?: string;
};

const Card = ({
  children,
  title,
  action,
  noPadding = false,
  className = "",
}: CardProps) => {
  return (
    <div
      className={`bg-surface-card border border-surface-border rounded-xl shadow-sm ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-border">
          {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
          {action}
        </div>
      )}
      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </div>
  );
};

export default Card;
