import type { MealConfig, MealSlotConfig } from "@/lib/types";

export const DEFAULT_SLOT_CONFIG: Record<
  "breakfast" | "lunch" | "dinner",
  MealSlotConfig
> = {
  breakfast: {
    totalCount: 2,
    tagMinimums: { veg: 0, meat: 0, soup: 0 },
  },
  lunch: {
    totalCount: 3,
    tagMinimums: { veg: 0, meat: 0, soup: 0 },
  },
  dinner: {
    totalCount: 4,
    tagMinimums: { veg: 1, meat: 1, soup: 1 },
  },
};

export const DEFAULT_MEAL_CONFIG: MealConfig = {
  breakfast: DEFAULT_SLOT_CONFIG.breakfast,
  lunch: DEFAULT_SLOT_CONFIG.lunch,
  dinner: DEFAULT_SLOT_CONFIG.dinner,
};

export function normalizeMealConfig(raw: unknown): MealConfig {
  const fallback = DEFAULT_MEAL_CONFIG;
  if (!raw || typeof raw !== "object") return fallback;

  const obj = raw as Record<string, unknown>;
  const slots = ["breakfast", "lunch", "dinner"] as const;

  const result = { ...fallback };
  for (const slot of slots) {
    const slotRaw = obj[slot];
    if (!slotRaw || typeof slotRaw !== "object") continue;
    const s = slotRaw as Record<string, unknown>;
    const totalCount =
      typeof s.totalCount === "number" && Number.isFinite(s.totalCount)
        ? Math.max(1, Math.min(8, Math.round(s.totalCount)))
        : fallback[slot].totalCount;
    const tagMinimums = { ...fallback[slot].tagMinimums };
    const mins = s.tagMinimums;
    if (mins && typeof mins === "object") {
      for (const tag of ["veg", "meat", "soup"] as const) {
        const v = (mins as Record<string, unknown>)[tag];
        if (typeof v === "number" && Number.isFinite(v)) {
          tagMinimums[tag] = Math.max(0, Math.min(4, Math.round(v)));
        }
      }
    }
    result[slot] = { totalCount, tagMinimums };
  }
  return result;
}
