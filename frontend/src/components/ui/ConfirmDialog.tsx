// 確認ダイアログコンポーネント
"use client";

import Button from "./Button";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  isDanger = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* ダイアログ本体 */}
      <div className="relative z-10 w-full max-w-sm mx-4 bg-surface-card border border-surface-border rounded-xl shadow-2xl p-6">
        <h2 className="text-lg font-semibold text-ink mb-2">{title}</h2>
        <p className="text-sm text-ink-secondary whitespace-pre-wrap mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "処理中..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
