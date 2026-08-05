// 汎用テーブルコンポーネント
"use client";

type Column<T> = {
  key: string;
  label: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
};

const Table = <T,>({
  columns,
  data,
  rowKey,
  onRowClick,
  isLoading = false,
  emptyMessage = "データがありません",
}: TableProps<T>) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-surface-border bg-surface-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border bg-surface-page/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-ink-secondary font-medium whitespace-nowrap ${col.className ?? ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-ink-muted"
              >
                読み込み中...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-ink-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-b border-surface-border/60 last:border-b-0
                  transition-all duration-200
                  ${onRowClick ? "cursor-pointer hover:bg-brand-faint" : "hover:bg-surface-page/50"}
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-ink ${col.className ?? ""}`}
                  >
                    {col.render
                      ? col.render(row)
                      : String(
                          (row as Record<string, unknown>)[col.key] ?? ""
                        )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
