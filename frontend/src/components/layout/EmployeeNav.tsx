// 従業員向けモバイル下部タブナビ（ルート / 日報）
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  // アイコンのSVGパス（24x24・stroke）
  iconPath: string;
};

// タブ定義
const NAV_ITEMS: NavItem[] = [
  {
    href: "/me/route",
    label: "本日のルート",
    iconPath:
      "M9 20l-5.5-2.5v-13L9 7l6-2.5L20.5 7v13L15 17.5 9 20zm0-13v13m6-15.5v13",
  },
  {
    href: "/me/daily-report",
    label: "日報",
    iconPath:
      "M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm2 5h6m-6 4h6m-6 4h4",
  },
];

const EmployeeNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-surface-border bg-surface-card">
      <div className="mx-auto flex h-16 max-w-lg">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-1 flex-col items-center justify-center gap-0.5
                transition-all duration-200
                ${isActive ? "text-brand" : "text-ink-muted hover:text-ink-secondary"}
              `}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d={item.iconPath} />
              </svg>
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default EmployeeNav;
