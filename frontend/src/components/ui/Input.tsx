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
        <label className="text-sm font-medium text-text-secondary">
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
          w-full px-3 py-2 rounded-md bg-background-tertiary border text-text-primary
          placeholder-text-muted outline-none transition-all duration-200
          ${error ? "border-status-danger" : "border-background-tertiary focus:border-accent"}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      />
      {error && <span className="text-sm text-status-danger">{error}</span>}
    </div>
  );
};

export default Input;
