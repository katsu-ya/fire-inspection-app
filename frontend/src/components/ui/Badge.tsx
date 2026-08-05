// ステータス表示用バッジ（ピル）コンポーネント
// 色だけに意味を持たせず、必ずテキストラベルを併記して使うこと
"use client";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "gray";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

// バリアントごとのスタイル
const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-status-success/10 text-status-success border-status-success/25",
  warning: "bg-status-warning/10 text-status-warning border-status-warning/25",
  danger: "bg-status-danger/10 text-status-danger border-status-danger/25",
  info: "bg-brand-light text-brand border-brand/20",
  gray: "bg-surface-page text-ink-secondary border-surface-border",
};

const Badge = ({ children, variant = "gray", className = "" }: BadgeProps) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border
        whitespace-nowrap ${variantClasses[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
