import { requireProfile } from "@/lib/auth";
import {
  fetchDishes,
  fetchMealHistory,
  fetchTomorrowPlan,
} from "@/lib/data/meals";
import { t } from "@/lib/i18n";
import { canEdit } from "@/lib/types";
import {
  EmptyPlanCard,
  HistoryList,
  PlanCard,
} from "@/components/meals/plan-card";

export default async function MealsPage() {
  const profile = await requireProfile();
  const tomorrowPlan = await fetchTomorrowPlan(profile.timezone);
  const history = await fetchMealHistory(profile.timezone);
  const dishes = await fetchDishes();
  const editable = canEdit(profile.role);

  return (
    <div className="space-y-6">
      <section>
        {tomorrowPlan ? (
          <PlanCard
            plan={tomorrowPlan}
            title={t(profile.locale, "meals.tomorrow")}
            editable={editable}
            allDishes={dishes}
          />
        ) : (
          <EmptyPlanCard editable={editable} />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          {t(profile.locale, "meals.history")}
        </h2>
        <HistoryList plans={history} />
      </section>
    </div>
  );
}
