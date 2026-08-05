// 汎用セレクトコンポーネント
"use client";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  required = false,
  className = "",
}: SelectProps) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-ink-secondary">
          {label}
          {required && <span className="text-status-danger ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className="
          w-full px-3 py-2 rounded-lg bg-surface-card border border-surface-border
          text-ink outline-none transition-all duration-200
          focus:border-brand focus:ring-2 focus:ring-brand-light
          disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-page
        "
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
