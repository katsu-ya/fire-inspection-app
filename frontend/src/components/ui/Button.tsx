// 汎用ボタンコンポーネント
"use client";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent hover:bg-accent-hover text-white",
  secondary: "bg-background-tertiary hover:bg-background-tertiary/80 text-text-primary",
  danger: "bg-status-danger hover:bg-status-danger/80 text-white",
  ghost: "bg-transparent hover:bg-background-tertiary text-text-secondary",
};

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
        inline-flex items-center justify-center gap-2 rounded-md font-medium
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
