"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale, useSetLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/types";

export function LanguageToggle() {
  const locale = useLocale();
  const setLocale = useSetLocale();
  if (!setLocale) return null;

  function toggle() {
    const next: Locale = locale === "en" ? "zh-CN" : "en";
    setLocale!(next);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1.5 px-2 text-xs text-stone-600"
      onClick={toggle}
    >
      <Languages className="h-3.5 w-3.5" />
      {locale === "en" ? "中文" : "EN"}
    </Button>
  );
}
