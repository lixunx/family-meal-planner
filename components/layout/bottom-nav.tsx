"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, Package, Settings, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

const tabs = [
  { href: "/meals", icon: UtensilsCrossed, labelKey: "nav.meals" as const },
  { href: "/dishes", icon: BookOpen, labelKey: "nav.dishes" as const },
  { href: "/inventory", icon: Package, labelKey: "nav.inventory" as const },
  { href: "/settings", icon: Settings, labelKey: "nav.settings" as const },
];

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {tabs.map(({ href, icon: Icon, labelKey }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors",
                active
                  ? "text-emerald-700"
                  : "text-stone-500 hover:text-stone-700"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span>{t(locale, labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
