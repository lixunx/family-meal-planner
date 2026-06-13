import { DEFAULT_LOCALE } from "@/lib/constants";
import {
  fetchGuestMealHistory,
  fetchGuestTomorrowPlan,
} from "@/lib/data/guest";
import { t } from "@/lib/i18n";
import { EmptyPlanCard, HistoryList, PlanCard } from "@/components/meals/plan-card";

export default async function GuestMealsPage() {
  const tomorrowPlan = await fetchGuestTomorrowPlan();
  const history = await fetchGuestMealHistory();

  return (
    <div className="space-y-6">
      <section>
        {tomorrowPlan ? (
          <PlanCard
            plan={tomorrowPlan}
            title={t(DEFAULT_LOCALE, "meals.tomorrow")}
            editable={false}
            allDishes={[]}
          />
        ) : (
          <EmptyPlanCard editable={false} />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          {t(DEFAULT_LOCALE, "meals.history")}
        </h2>
        <HistoryList plans={history} />
      </section>
    </div>
  );
}
