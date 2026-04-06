// サイドバーナビゲーションコンポーネント
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "ダッシュボード", icon: "▤" },
  { href: "/products", label: "商品管理", icon: "◫" },
  { href: "/inventory", label: "入出庫", icon: "↔" },
  { href: "/alerts", label: "アラート", icon: "⚠" },
  { href: "/reports", label: "レポート", icon: "▦" },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-background-secondary border-r border-background-tertiary flex flex-col">
      {/* ロゴ */}
      <div className="px-6 py-5 border-b border-background-tertiary">
        <h1 className="text-accent font-bold text-lg leading-tight">
          在庫管理
          <span className="block text-text-muted text-xs font-normal mt-0.5">Inventory System</span>
        </h1>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? "bg-accent text-white"
                      : "text-text-secondary hover:bg-background-tertiary hover:text-text-primary"
                    }
                  `}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
