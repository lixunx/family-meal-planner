import type { Locale } from "@/lib/types";

export const GUEST_DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "mp-locale";

export function readLocaleCookie(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.split("=")[1]);
  return value === "en" || value === "zh-CN" ? value : null;
}

export function writeLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;sameSite=lax`;
}
