"use client";

import { useTransition } from "react";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale, useT } from "@/components/locale-provider";
import {
  confirmPlanAction,
  removeDishFromPlanAction,
} from "@/app/actions/meals";
import { mealSlotLabel, tagLabel } from "@/lib/i18n";
import type { Dish, MealPlanItem, MealPlanWithItems, MealSlot } from "@/lib/types";
import { MEAL_SLOTS } from "@/lib/types";
import { formatPlanDate } from "@/lib/utils";
import { AddDishDialog } from "./add-dish-dialog";
import { RecommendButton } from "./recommend-button";

function groupBySlot(items: MealPlanItem[]) {
  const groups: Record<MealSlot, MealPlanItem[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
  };
  for (const item of items) {
    groups[item.meal_slot].push(item);
  }
  for (const slot of MEAL_SLOTS) {
    groups[slot].sort((a, b) => a.sort_order - b.sort_order);
  }
  return groups;
}

export function PlanCard({
  plan,
  title,
  editable,
  allDishes,
}: {
  plan: MealPlanWithItems;
  title: string;
  editable: boolean;
  allDishes: Dish[];
}) {
  const locale = useLocale();
  const tr = useT();
  const [pending, startTransition] = useTransition();
  const grouped = groupBySlot(plan.items);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-stone-500">
            {formatPlanDate(plan.plan_date, locale)}
            {" · "}
            {plan.status === "draft" ? tr("meals.draft") : tr("meals.confirmed")}
          </p>
        </div>
        {editable && plan.status === "draft" && (
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                void confirmPlanAction(plan.id);
              })
            }
          >
            <Check className="h-4 w-4" />
            {tr("meals.confirm")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {editable && plan.status === "draft" && (
          <RecommendButton existingPlanId={plan.id} />
        )}
        {MEAL_SLOTS.map((slot) => (
          <div key={slot}>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-emerald-800">
                {mealSlotLabel(locale, slot)}
              </h4>
              {editable && (
                <AddDishDialog
                  planId={plan.id}
                  slot={slot}
                  allDishes={allDishes}
                />
              )}
            </div>
            {grouped[slot].length === 0 ? (
              <p className="text-sm text-stone-400">—</p>
            ) : (
              <ul className="space-y-2">
                {grouped[slot].map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2"
                  >
                    <div>
                      <span className="font-medium">
                        {item.dish?.name ?? "—"}
                      </span>
                      {item.dish?.tags && item.dish.tags.length > 0 && (
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {item.dish.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] text-stone-600"
                            >
                              {tagLabel(locale, tag)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {editable && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-stone-400 hover:text-red-600"
                        onClick={() =>
                          startTransition(() => {
                            void removeDishFromPlanAction(item.id);
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function EmptyPlanCard({ editable }: { editable: boolean }) {
  const tr = useT();

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-stone-500">{tr("meals.noPlan")}</p>
        {editable && <RecommendButton />}
      </CardContent>
    </Card>
  );
}

export function HistoryList({ plans }: { plans: MealPlanWithItems[] }) {
  const locale = useLocale();
  const tr = useT();

  if (plans.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-stone-400">
        {tr("meals.emptyHistory")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => {
        const grouped = groupBySlot(plan.items);
        return (
          <Card key={plan.id}>
            <CardContent className="py-3">
              <p className="mb-2 text-sm font-medium text-stone-700">
                {formatPlanDate(plan.plan_date, locale)}
              </p>
              <div className="space-y-1 text-sm text-stone-600">
                {MEAL_SLOTS.map((slot) => (
                  <p key={slot}>
                    <span className="font-medium text-stone-500">
                      {mealSlotLabel(locale, slot)}:
                    </span>{" "}
                    {grouped[slot].map((i) => i.dish?.name).join(", ") || "—"}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
