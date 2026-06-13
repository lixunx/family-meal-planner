"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/guest/meals", icon: UtensilsCrossed, label: "餐单", labelEn: "Meals" },
  { href: "/guest/inventory", icon: Package, label: "库存", labelEn: "Inventory" },
];

export function GuestBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[72px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                active
                  ? "text-emerald-700"
                  : "text-stone-500 hover:text-stone-700"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
