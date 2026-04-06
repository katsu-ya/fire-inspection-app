// ソート・ページネーション対応テーブルコンポーネント
"use client";

type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  sortKey?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  page?: number;
  pages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
};

const Table = <T extends Record<string, unknown>>({
  columns,
  data,
  sortKey,
  sortOrder,
  onSort,
  page,
  pages,
  onPageChange,
  isLoading = false,
  emptyMessage = "データがありません",
}: TableProps<T>) => {
  const getSortIcon = (key: string) => {
    if (sortKey !== key) return "↕";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-background-tertiary">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-background-tertiary bg-background-tertiary/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`
                    px-4 py-3 text-left text-text-secondary font-medium
                    ${col.sortable ? "cursor-pointer hover:text-text-primary select-none transition-colors duration-200" : ""}
                  `}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="text-xs opacity-60">{getSortIcon(col.key)}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-text-muted">
                  読み込み中...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-background-tertiary/50 hover:bg-background-tertiary/20 transition-colors duration-200"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-text-primary">
                      {col.render ? col.render(row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {pages !== undefined && pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => onPageChange?.(page! - 1)}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-background-tertiary text-text-secondary disabled:opacity-40 hover:bg-accent hover:text-white transition-all duration-200"
          >
            前へ
          </button>
          <span className="text-text-secondary text-sm">
            {page} / {pages}
          </span>
          <button
            onClick={() => onPageChange?.(page! + 1)}
            disabled={page === pages}
            className="px-3 py-1 rounded bg-background-tertiary text-text-secondary disabled:opacity-40 hover:bg-accent hover:text-white transition-all duration-200"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
