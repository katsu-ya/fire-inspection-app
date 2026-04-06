// 在庫数・種別表示用バッジコンポーネント
"use client";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "default";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-status-success/20 text-status-success border-status-success/30",
  warning: "bg-status-warning/20 text-status-warning border-status-warning/30",
  danger: "bg-status-danger/20 text-status-danger border-status-danger/30",
  info: "bg-accent/20 text-accent border-accent/30",
  default: "bg-background-tertiary text-text-secondary border-background-tertiary",
};

const Badge = ({ children, variant = "default", className = "" }: BadgeProps) => {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
        ${variantClasses[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
