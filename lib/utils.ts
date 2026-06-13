import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPlanDate(date: string, locale: string): string {
  const d = new Date(date + "T12:00:00");
  return d.toLocaleDateString(locale === "zh-CN" ? "zh-CN" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getTomorrowDate(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = formatter.format(now);
  const today = new Date(todayStr + "T12:00:00");
  today.setDate(today.getDate() + 1);
  return today.toISOString().slice(0, 10);
}

export function getTodayDate(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
