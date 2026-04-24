"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "~/lib/cn";

const TABS = [
  { href: "/account/orders", label: "我的訂單" },
  { href: "/account/profile", label: "個人資料" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 border-b">
      <nav className="flex">
        {TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-3 text-base font-medium border-b-2 transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
