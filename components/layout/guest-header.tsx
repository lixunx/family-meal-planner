"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/language-toggle";
import { useT } from "@/components/locale-provider";

export function GuestHeader() {
  const tr = useT();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold text-emerald-800">
          {tr("app.title")}
        </h1>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <Link
            href="/login"
            className="text-xs font-medium text-emerald-700 underline"
          >
            {tr("auth.signIn")}
          </Link>
        </div>
      </div>
      <p className="mt-0.5 text-xs text-stone-500">{tr("guest.readOnly")}</p>
    </header>
  );
}
