"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale, useT } from "@/components/locale-provider";
import {
  addDishToPlanAction,
  addExistingDishToPlanAction,
} from "@/app/actions/meals";
import { recommendDishesWhileTyping } from "@/lib/dishes/similarity";
import { createClient } from "@/lib/supabase/client";
import { tagLabel } from "@/lib/i18n";
import type { Dish, DishTag, MealSlot } from "@/lib/types";
import { DISH_TAGS } from "@/lib/types";

export function AddDishDialog({
  planId,
  slot,
  allDishes,
}: {
  planId: string;
  slot: MealSlot;
  allDishes: Dish[];
}) {
  const locale = useLocale();
  const tr = useT();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tags, setTags] = useState<DishTag[]>(["other"]);
  const [pending, startTransition] = useTransition();
  const [dishes, setDishes] = useState<Dish[]>(allDishes);

  useEffect(() => {
    setDishes(allDishes);
  }, [allDishes]);

  useEffect(() => {
    if (!open) return;

    const supabase = createClient();
    supabase
      .from("dishes")
      .select("*")
      .order("name")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setDishes(data as Dish[]);
        }
      });
  }, [open]);

  const suggestions = useMemo(() => {
    if (!name.trim()) return [];
    return recommendDishesWhileTyping(dishes, name.trim(), {
      mealSlot: slot,
      limit: 8,
    });
  }, [dishes, name, slot]);

  const topSuggestion = suggestions[0] ?? null;
  const isLikelyDuplicate =
    topSuggestion != null && topSuggestion.score >= 0.78;

  function resetAndClose() {
    setOpen(false);
    setName("");
  }

  function toggleTag(tag: DishTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleAddExisting(dishId: string) {
    startTransition(async () => {
      await addExistingDishToPlanAction(planId, slot, dishId);
      resetAndClose();
    });
  }

  function handleAddNew(forceCreate = false) {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await addDishToPlanAction(
        planId,
        slot,
        name.trim(),
        tags,
        forceCreate
      );
      if (result?.error === "similar_dish_exists") {
        return;
      }
      resetAndClose();
    });
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {tr("meals.addDish")}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold">{tr("meals.addDish")}</h3>

        <div className="space-y-3">
          <div>
            <Label>{tr("meals.dishName")}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tr("meals.dishName")}
              autoFocus
            />
          </div>

          {suggestions.length > 0 && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-emerald-800">
                <Sparkles className="h-3.5 w-3.5" />
                {isLikelyDuplicate
                  ? tr("meals.similarDishFound")
                  : tr("meals.suggestions")}
                <span className="font-normal text-emerald-600">
                  · {tr("meals.tapToAdd")}
                </span>
              </div>
              <ul className="space-y-1.5">
                {suggestions.map(({ dish, score }, index) => (
                  <li key={dish.id}>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleAddExisting(dish.id)}
                      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium shadow-sm ring-1 transition-colors active:scale-[0.99] ${
                        index === 0 && score >= 0.78
                          ? "bg-emerald-100 text-emerald-900 ring-emerald-300 hover:bg-emerald-200"
                          : "bg-white text-stone-800 ring-emerald-100 hover:bg-emerald-100"
                      }`}
                    >
                      {dish.name}
                    </button>
                  </li>
                ))}
              </ul>
              {isLikelyDuplicate && (
                <button
                  type="button"
                  className="mt-2 w-full text-center text-xs text-stone-500 underline"
                  disabled={pending}
                  onClick={() => handleAddNew(true)}
                >
                  {tr("meals.createAnyway")}
                </button>
              )}
            </div>
          )}

          <div>
            <Label>{tr("meals.dishTags")}</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {DISH_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    tags.includes(tag)
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {tagLabel(locale, tag)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={!name.trim() || pending || isLikelyDuplicate}
              onClick={() => handleAddNew(false)}
            >
              {tr("common.save")}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={resetAndClose}
            >
              {tr("common.cancel")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
