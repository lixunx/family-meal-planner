"use client";

import { useAppData } from "@/components/app-data-provider";
import {
  EmptyPlanCard,
  HistoryList,
  PlanCard,
} from "@/components/meals/plan-card";
import { useT } from "@/components/locale-provider";
import { canEdit } from "@/lib/types";

export function MealsPageContent() {
  const tr = useT();
  const { profile, tomorrowPlan, history, dishes } = useAppData();
  const editable = canEdit(profile.role);

  return (
    <div className="space-y-6">
      <section>
        {tomorrowPlan ? (
          <PlanCard
            plan={tomorrowPlan}
            title={tr("meals.tomorrow")}
            editable={editable}
            allDishes={dishes}
          />
        ) : (
          <EmptyPlanCard editable={editable} />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          {tr("meals.history")}
        </h2>
        <HistoryList plans={history} />
      </section>
    </div>
  );
}
