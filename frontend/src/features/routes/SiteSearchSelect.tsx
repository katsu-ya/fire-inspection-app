// 現場マスタを検索してルートに追加するための検索セレクト
"use client";

import { useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import type { Site } from "@/types";
import Button from "@/components/ui/Button";

type SiteSearchSelectProps = {
  // 現場を選択したときのコールバック
  onSelect: (site: Site) => void;
};

const SiteSearchSelect = ({ onSelect }: SiteSearchSelectProps) => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Site[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  // キーワードで現場を検索する
  const handleSearch = async () => {
    setIsSearching(true);
    setError("");
    try {
      const { data } = await api.get<Site[]>("/api/v1/admin/sites", {
        params: { keyword },
      });
      setResults(data.filter((site) => site.is_active));
      setHasSearched(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "現場の検索に失敗しました"));
    } finally {
      setIsSearching(false);
    }
  };

  // 現場を選択して結果をクリアする
  const handleSelect = (site: Site) => {
    onSelect(site);
    setResults([]);
    setHasSearched(false);
    setKeyword("");
  };

  return (
    <div className="rounded-lg border border-dashed border-surface-border bg-surface-page/50 p-4">
      <p className="mb-2 text-sm font-medium text-ink-secondary">現場を追加</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="現場名・住所で検索"
          className="flex-1 rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-ink placeholder-ink-muted outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand-light"
        />
        <Button variant="secondary" onClick={handleSearch} disabled={isSearching}>
          {isSearching ? "検索中..." : "検索"}
        </Button>
      </div>

      {/* エラーメッセージ */}
      {error && <p className="mt-2 text-sm text-status-danger">{error}</p>}

      {/* 検索結果リスト */}
      {hasSearched && (
        <div className="mt-3 max-h-56 overflow-y-auto rounded-lg border border-surface-border bg-surface-card">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-muted">
              該当する現場がありません
            </p>
          ) : (
            <ul>
              {results.map((site) => (
                <li key={site.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(site)}
                    className="flex w-full items-center justify-between gap-3 border-b border-surface-border/60 px-4 py-2.5 text-left transition-all duration-200 last:border-b-0 hover:bg-brand-faint"
                  >
                    <span>
                      <span className="block text-sm font-medium text-ink">
                        {site.name}
                      </span>
                      <span className="block text-xs text-ink-muted">
                        {site.address ?? "住所未登録"}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-medium text-brand">
                      追加
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SiteSearchSelect;
