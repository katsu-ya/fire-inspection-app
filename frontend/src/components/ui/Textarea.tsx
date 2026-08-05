// 汎用テキストエリアコンポーネント
"use client";

type TextareaProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled = false,
  required = false,
  className = "",
}: TextareaProps) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-ink-secondary">
          {label}
          {required && <span className="text-status-danger ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        className="
          w-full px-3 py-2 rounded-lg bg-surface-card border border-surface-border
          text-ink placeholder-ink-muted outline-none transition-all duration-200
          focus:border-brand focus:ring-2 focus:ring-brand-light resize-y
          disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-page
        "
      />
    </div>
  );
};

export default Textarea;
