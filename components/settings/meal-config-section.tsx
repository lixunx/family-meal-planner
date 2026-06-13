"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale, useT } from "@/components/locale-provider";
import { updateMealConfigAction } from "@/app/actions/meal-config";
import { mealSlotLabel } from "@/lib/i18n";
import type { MealConfig, MealSlot } from "@/lib/types";
import { MEAL_SLOTS } from "@/lib/types";
import { useAppData } from "@/components/app-data-provider";

function clampInt(value: string, min: number, max: number, fallback: number) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export function MealConfigSection({
  config: initialConfig,
  editable,
}: {
  config: MealConfig;
  editable: boolean;
}) {
  const locale = useLocale();
  const tr = useT();
  const { setMealConfig } = useAppData();
  const [config, setConfig] = useState(initialConfig);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  function updateSlot(
    slot: MealSlot,
    field: "totalCount" | "veg" | "meat" | "soup",
    value: string
  ) {
    setSaved(false);
    setError(null);
    setConfig((prev) => {
      const next = { ...prev };
      if (field === "totalCount") {
        next[slot] = {
          ...next[slot],
          totalCount: clampInt(value, 1, 8, next[slot].totalCount),
        };
      } else {
        next[slot] = {
          ...next[slot],
          tagMinimums: {
            ...next[slot].tagMinimums,
            [field]: clampInt(value, 0, 4, next[slot].tagMinimums[field]),
          },
        };
      }
      return next;
    });
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        const result = await updateMealConfigAction(JSON.stringify(config));
        if (result?.success) {
          setMealConfig(config);
          setSaved(true);
          return;
        }
        setError(result?.error ?? tr("common.error"));
      } catch {
        setError(tr("common.error"));
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500">{tr("settings.mealConfigHint")}</p>
      {MEAL_SLOTS.map((slot) => (
        <div
          key={slot}
          className="space-y-3 rounded-xl border border-stone-100 bg-stone-50 p-3"
        >
          <p className="text-sm font-medium text-emerald-800">
            {mealSlotLabel(locale, slot)}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{tr("settings.totalDishes")}</Label>
              <Input
                type="number"
                min={1}
                max={8}
                value={config[slot].totalCount}
                disabled={!editable}
                onChange={(e) =>
                  updateSlot(slot, "totalCount", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">{tr("settings.minVeg")}</Label>
              <Input
                type="number"
                min={0}
                max={4}
                value={config[slot].tagMinimums.veg}
                disabled={!editable}
                onChange={(e) => updateSlot(slot, "veg", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">{tr("settings.minMeat")}</Label>
              <Input
                type="number"
                min={0}
                max={4}
                value={config[slot].tagMinimums.meat}
                disabled={!editable}
                onChange={(e) => updateSlot(slot, "meat", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">{tr("settings.minSoup")}</Label>
              <Input
                type="number"
                min={0}
                max={4}
                value={config[slot].tagMinimums.soup}
                disabled={!editable}
                onChange={(e) => updateSlot(slot, "soup", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && (
        <p className="text-sm text-emerald-700">{tr("settings.saved")}</p>
      )}
      {editable && (
        <Button onClick={handleSave} disabled={pending} className="w-full">
          {pending ? tr("common.loading") : tr("common.save")}
        </Button>
      )}
    </div>
  );
}
