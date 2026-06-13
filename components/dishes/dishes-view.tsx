"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale, useT } from "@/components/locale-provider";
import { createLibraryDishAction } from "@/app/actions/dishes";
import { recommendDishesWhileTyping } from "@/lib/dishes/similarity";
import { createClient } from "@/lib/supabase/client";
import { mealSlotLabel, tagLabel } from "@/lib/i18n";
import type { Dish, DishTag, MealSlot } from "@/lib/types";
import { DISH_TAGS, MEAL_SLOTS } from "@/lib/types";

export function DishesView({
  dishes: initialDishes,
  editable,
}: {
  dishes: Dish[];
  editable: boolean;
}) {
  const locale = useLocale();
  const tr = useT();
  const [dishes, setDishes] = useState(initialDishes);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [tags, setTags] = useState<DishTag[]>(["other"]);
  const [mealTypes, setMealTypes] = useState<MealSlot[]>([
    "breakfast",
    "lunch",
    "dinner",
  ]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setDishes(initialDishes);
  }, [initialDishes]);

  const suggestions = useMemo(() => {
    if (!name.trim()) return [];
    return recommendDishesWhileTyping(dishes, name.trim(), { limit: 4 });
  }, [dishes, name]);

  const grouped = DISH_TAGS.reduce(
    (acc, tag) => {
      acc[tag] = dishes.filter((d) => d.tags.includes(tag));
      return acc;
    },
    {} as Record<DishTag, Dish[]>
  );

  function toggleTag(tag: DishTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function toggleMealType(slot: MealSlot) {
    setMealTypes((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  }

  function handleSave(forceCreate = false) {
    startTransition(async () => {
      const result = await createLibraryDishAction(
        name,
        tags,
        mealTypes,
        forceCreate
      );
      if (result?.error === "similar_dish_exists") return;
      if (result?.success) {
        const supabase = createClient();
        const { data } = await supabase.from("dishes").select("*").order("name");
        if (data) setDishes(data as Dish[]);
        setName("");
        setShowAdd(false);
      }
    });
  }

  return (
    <div className="space-y-4">
      {editable && (
        <Button
          className="w-full"
          variant={showAdd ? "secondary" : "default"}
          onClick={() => setShowAdd((v) => !v)}
        >
          <Plus className="h-4 w-4" />
          {tr("dishes.add")}
        </Button>
      )}

      {showAdd && editable && (
        <Card>
          <CardContent className="space-y-3 pt-4">
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
                  {tr("meals.similarDishFound")}
                </div>
                <ul className="space-y-1 text-sm text-stone-700">
                  {suggestions.map(({ dish }) => (
                    <li key={dish.id}>{dish.name}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-2 text-xs text-stone-500 underline"
                  onClick={() => handleSave(true)}
                >
                  {tr("meals.createAnyway")}
                </button>
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

            <div>
              <Label>{tr("dishes.mealTypes")}</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {MEAL_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleMealType(slot)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      mealTypes.includes(slot)
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {mealSlotLabel(locale, slot)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={!name.trim() || pending}
                onClick={() => handleSave(false)}
              >
                {tr("common.save")}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowAdd(false)}
              >
                {tr("common.cancel")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {DISH_TAGS.map((tag) => (
        <Card key={tag}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{tagLabel(locale, tag)}</CardTitle>
          </CardHeader>
          <CardContent>
            {grouped[tag].length === 0 ? (
              <p className="text-sm text-stone-400">{tr("dishes.empty")}</p>
            ) : (
              <ul className="space-y-2">
                {grouped[tag].map((dish) => (
                  <li
                    key={dish.id}
                    className="rounded-xl bg-stone-50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{dish.name}</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dish.meal_types.map((slot) => (
                        <span
                          key={slot}
                          className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] text-stone-600"
                        >
                          {mealSlotLabel(locale, slot)}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
