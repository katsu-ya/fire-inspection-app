// モーダルダイアログコンポーネント
"use client";

import { useEffect } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

// サイズごとの最大幅
const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

const Modal = ({ isOpen, onClose, title, children, size = "md" }: ModalProps) => {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* モーダル本体 */}
      <div
        className={`
          relative z-10 w-full mx-4 ${sizeClasses[size]}
          bg-surface-card border border-surface-border rounded-xl shadow-2xl
          max-h-[85vh] flex flex-col
        `}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink transition-all duration-200 text-xl leading-none"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
        {/* コンテンツ */}
        <div className="px-6 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
