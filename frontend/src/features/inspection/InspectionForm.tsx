// 点検入力フォーム: カテゴリごとのアコーディオン+3択セグメント+備考
"use client";

import { useMemo, useState } from "react";
import type {
  InspectionFormItem,
  InspectionResultInput,
  InspectionResultValue,
} from "@/types";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

// 項目ごとの入力状態
type Entry = {
  result: InspectionResultValue | null;
  note: string;
};

type InspectionFormProps = {
  items: InspectionFormItem[];
  initialRemarks: string | null;
  isSaving: boolean;
  // 一時保存時のコールバック（remarksと入力済み結果を渡す）
  onSave: (remarks: string, results: InspectionResultInput[]) => void;
};

// セグメントボタンの選択肢定義
const RESULT_OPTIONS: Array<{
  value: InspectionResultValue;
  label: string;
  selectedClass: string;
}> = [
  { value: "PASS", label: "良", selectedClass: "bg-status-success text-white border-status-success" },
  { value: "FAIL", label: "不良", selectedClass: "bg-status-danger text-white border-status-danger" },
  { value: "NA", label: "対象外", selectedClass: "bg-ink-secondary text-white border-ink-secondary" },
];

const InspectionForm = ({
  items,
  initialRemarks,
  isSaving,
  onSave,
}: InspectionFormProps) => {
  // 項目ID→入力状態のマップ（初期値はAPIの入力済み結果）
  const [entries, setEntries] = useState<Record<number, Entry>>(() => {
    const map: Record<number, Entry> = {};
    items.forEach((item) => {
      map[item.item_id] = { result: item.result, note: item.note ?? "" };
    });
    return map;
  });
  const [remarks, setRemarks] = useState(initialRemarks ?? "");
  // カテゴリごとの開閉状態（初期状態はすべて開く）
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () => {
      const map: Record<string, boolean> = {};
      items.forEach((item) => {
        map[item.category] = true;
      });
      return map;
    }
  );

  // カテゴリごとにグループ化する（display_order順を維持）
  const groupedItems = useMemo(() => {
    const groups: Array<{ category: string; items: InspectionFormItem[] }> = [];
    [...items]
      .sort((a, b) => a.display_order - b.display_order)
      .forEach((item) => {
        const group = groups.find((g) => g.category === item.category);
        if (group) {
          group.items.push(item);
        } else {
          groups.push({ category: item.category, items: [item] });
        }
      });
    return groups;
  }, [items]);

  // 未入力の項目数
  const unenteredCount = items.filter(
    (item) => (entries[item.item_id]?.result ?? null) === null
  ).length;

  // 結果を選択する
  const setResult = (itemId: number, result: InspectionResultValue) => {
    setEntries((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], result },
    }));
  };

  // 備考を更新する
  const setNote = (itemId: number, note: string) => {
    setEntries((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], note },
    }));
  };

  // カテゴリ内をすべて「良」にする
  const setAllPassInCategory = (category: string) => {
    setEntries((prev) => {
      const next = { ...prev };
      items
        .filter((item) => item.category === category)
        .forEach((item) => {
          next[item.item_id] = { ...next[item.item_id], result: "PASS" };
        });
      return next;
    });
  };

  // カテゴリの開閉を切り替える
  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  // 一時保存を実行する（入力済みの項目のみ送信する）
  const handleSave = () => {
    const results: InspectionResultInput[] = [];
    items.forEach((item) => {
      const entry = entries[item.item_id];
      if (entry && entry.result !== null) {
        results.push({
          item_id: item.item_id,
          result: entry.result,
          note: entry.note,
        });
      }
    });
    onSave(remarks, results);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* カテゴリごとのアコーディオン */}
      {groupedItems.map((group) => {
        const isOpen = openCategories[group.category] ?? true;
        const entered = group.items.filter(
          (item) => (entries[item.item_id]?.result ?? null) !== null
        ).length;
        return (
          <section
            key={group.category}
            className="overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm"
          >
            {/* カテゴリヘッダー */}
            <button
              type="button"
              onClick={() => toggleCategory(group.category)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-all duration-200 hover:bg-surface-page/60"
            >
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">
                  {group.category}
                </span>
                <span className="rounded-full bg-surface-page px-2 py-0.5 text-[11px] text-ink-secondary">
                  {entered} / {group.items.length}
                </span>
              </span>
              <span className="text-ink-muted">{isOpen ? "▾" : "▸"}</span>
            </button>

            {isOpen && (
              <div className="border-t border-surface-border">
                {/* 一括「良」ボタン */}
                <div className="flex justify-end px-4 pt-3">
                  <button
                    type="button"
                    onClick={() => setAllPassInCategory(group.category)}
                    className="rounded-md border border-status-success/40 px-2.5 py-1 text-xs font-medium text-status-success transition-all duration-200 hover:bg-status-success/10"
                  >
                    このカテゴリを一括で良にする
                  </button>
                </div>

                {/* 項目リスト */}
                <ul className="divide-y divide-surface-border/60">
                  {group.items.map((item) => {
                    const entry = entries[item.item_id] ?? {
                      result: null,
                      note: "",
                    };
                    return (
                      <li key={item.item_id} className="space-y-2 px-4 py-3">
                        <p className="text-sm text-ink">{item.name}</p>
                        {/* 良/不良/対象外の3択セグメント */}
                        <div className="flex gap-2">
                          {RESULT_OPTIONS.map((opt) => {
                            const isSelected = entry.result === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setResult(item.item_id, opt.value)}
                                className={`
                                  flex-1 rounded-lg border py-2.5 text-sm font-medium
                                  transition-all duration-200
                                  ${
                                    isSelected
                                      ? opt.selectedClass
                                      : "border-surface-border bg-surface-card text-ink-secondary hover:bg-surface-page"
                                  }
                                `}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                        {/* 備考（不良時は入力を促す） */}
                        <input
                          type="text"
                          value={entry.note}
                          onChange={(e) => setNote(item.item_id, e.target.value)}
                          placeholder={
                            entry.result === "FAIL"
                              ? "不良内容・指摘事項を入力してください"
                              : "備考（任意）"
                          }
                          className={`
                            w-full rounded-lg border bg-surface-card px-3 py-2 text-sm text-ink
                            placeholder-ink-muted outline-none transition-all duration-200
                            focus:ring-2 focus:ring-brand-light
                            ${
                              entry.result === "FAIL"
                                ? "border-status-danger/40 focus:border-status-danger"
                                : "border-surface-border focus:border-brand"
                            }
                          `}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        );
      })}

      {/* 全体所見 */}
      <div className="rounded-xl border border-surface-border bg-surface-card p-4 shadow-sm">
        <Textarea
          label="全体所見"
          value={remarks}
          onChange={setRemarks}
          rows={3}
          placeholder="現場全体の所見を入力"
        />
      </div>

      {/* 下部固定バー: 未入力件数+一時保存 */}
      <div className="fixed bottom-16 inset-x-0 z-30 border-t border-surface-border bg-surface-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          {unenteredCount > 0 ? (
            <span className="text-sm font-medium text-status-warning">
              未入力 {unenteredCount}件
            </span>
          ) : (
            <span className="text-sm font-medium text-status-success">
              全項目入力済み
            </span>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "保存中..." : "一時保存"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InspectionForm;
