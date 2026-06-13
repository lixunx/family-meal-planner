"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/types";
import { t, type TranslationKey } from "@/lib/i18n";
import { readLocaleCookie, writeLocaleCookie } from "@/lib/locale-cookie";

interface LocaleContextValue {
  locale: Locale;
  setLocale?: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({ locale: "zh-CN" });

export function LocaleProvider({
  locale: serverLocale,
  allowToggle = false,
  children,
}: {
  locale: Locale;
  allowToggle?: boolean;
  children: ReactNode;
}) {
  const [clientLocale, setClientLocale] = useState<Locale | null>(null);

  useEffect(() => {
    if (allowToggle) {
      setClientLocale(readLocaleCookie() ?? serverLocale);
    }
  }, [allowToggle, serverLocale]);

  const activeLocale = allowToggle && clientLocale ? clientLocale : serverLocale;

  const setLocale = useCallback(
    (next: Locale) => {
      if (!allowToggle) return;
      setClientLocale(next);
      writeLocaleCookie(next);
    },
    [allowToggle]
  );

  return (
    <LocaleContext.Provider
      value={{
        locale: activeLocale,
        setLocale: allowToggle ? setLocale : undefined,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}

export function useSetLocale(): ((locale: Locale) => void) | undefined {
  return useContext(LocaleContext).setLocale;
}

export function useT() {
  const locale = useLocale();
  return (key: TranslationKey) => t(locale, key);
}
