"use client";

import { useGuestData } from "@/components/guest-data-provider";
import {
  EmptyPlanCard,
  HistoryList,
  PlanCard,
} from "@/components/meals/plan-card";
import { useT } from "@/components/locale-provider";

export function GuestMealsPageContent() {
  const tr = useT();
  const { tomorrowPlan, history } = useGuestData();

  return (
    <div className="space-y-6">
      <section>
        {tomorrowPlan ? (
          <PlanCard
            plan={tomorrowPlan}
            title={tr("meals.tomorrow")}
            editable={false}
            allDishes={[]}
          />
        ) : (
          <EmptyPlanCard editable={false} />
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
