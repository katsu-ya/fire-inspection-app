// 管理者向けサイドバー（濃紺・幅240px固定）
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = {
  href: string;
  label: string;
  // アイコンのSVGパス（24x24・stroke）
  iconPath: string;
};

// メニュー定義
const MENU_ITEMS: MenuItem[] = [
  {
    href: "/admin/dashboard",
    label: "ダッシュボード",
    iconPath:
      "M3 13.5V21h6v-5.25h6V21h6v-7.5L12 4.5 3 13.5z",
  },
  {
    href: "/admin/routes",
    label: "ルート設定",
    iconPath:
      "M9 20l-5.5-2.5v-13L9 7l6-2.5L20.5 7v13L15 17.5 9 20zm0-13v13m6-15.5v13",
  },
  {
    href: "/admin/staff",
    label: "職員マスタ",
    iconPath:
      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1",
  },
  {
    href: "/admin/sites",
    label: "現場マスタ",
    iconPath:
      "M4 21V5a2 2 0 012-2h8a2 2 0 012 2v16M4 21h16M8 7h2m-2 4h2m-2 4h2m6 6v-8h4v8",
  },
  {
    href: "/admin/items",
    label: "点検項目マスタ",
    iconPath:
      "M9 5h6a2 2 0 012 2v13a1 1 0 01-1 1H8a1 1 0 01-1-1V7a2 2 0 012-2zm0 0V4a1 1 0 011-1h4a1 1 0 011 1v1m-6 6l2 2 4-4",
  },
  {
    href: "/admin/daily-reports",
    label: "日報一覧",
    iconPath:
      "M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm2 5h6m-6 4h6m-6 4h4",
  },
];

const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-navy border-r border-navy-border flex flex-col">
      {/* ロゴ・システム名 */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-navy-border">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-hover shrink-0">
          {/* 炎のアイコン */}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-white"
            aria-hidden="true"
          >
            <path d="M12 2c.6 3-0.6 4.6-2 6-1.6 1.6-3 3.4-3 6a7 7 0 0014 0c0-2.3-1-4-2.2-5.5-.4 1-.9 1.7-1.8 2.3.3-3-1-6.8-5-8.8z" />
          </svg>
        </span>
        <div className="leading-tight">
          <p className="text-white text-sm font-bold">消防保守点検</p>
          <p className="text-white/60 text-[11px]">システム</p>
        </div>
      </div>

      {/* メニュー */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm
                    border-l-4 transition-all duration-200
                    ${
                      isActive
                        ? "border-brand bg-navy-light text-white font-medium"
                        : "border-transparent text-white/70 hover:bg-navy-light/60 hover:text-white"
                    }
                  `}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  >
                    <path d={item.iconPath} />
                  </svg>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* フッター */}
      <div className="px-5 py-4 border-t border-navy-border">
        <p className="text-white/40 text-[11px]">消防保守点検システム v1.0</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
