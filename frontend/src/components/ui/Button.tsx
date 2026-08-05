// 汎用ボタンコンポーネント
"use client";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost";

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
};

// バリアントごとのスタイル
const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand hover:bg-brand-hover text-white shadow-sm",
  secondary:
    "bg-surface-card hover:bg-brand-faint text-ink-secondary border border-surface-border",
  danger: "bg-status-danger hover:bg-status-danger/85 text-white shadow-sm",
  success: "bg-status-success hover:bg-status-success/85 text-white shadow-sm",
  ghost: "bg-transparent hover:bg-brand-faint text-ink-secondary",
};

// サイズごとのスタイル
const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  onClick,
  className = "",
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
