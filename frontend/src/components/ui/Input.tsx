// 汎用インプットコンポーネント
"use client";

type InputProps = {
  label?: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
};

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error,
  className = "",
}: InputProps) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-ink-secondary">
          {label}
          {required && <span className="text-status-danger ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full px-3 py-2 rounded-lg bg-surface-card border text-ink
          placeholder-ink-muted outline-none transition-all duration-200
          ${error ? "border-status-danger" : "border-surface-border focus:border-brand focus:ring-2 focus:ring-brand-light"}
          disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-page
        `}
      />
      {error && <span className="text-sm text-status-danger">{error}</span>}
    </div>
  );
};

export default Input;
