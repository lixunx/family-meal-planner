import { requireProfile } from "@/lib/auth";
import { fetchDishes } from "@/lib/data/meals";
import { DishesView } from "@/components/dishes/dishes-view";
import { canEdit } from "@/lib/types";
import { t } from "@/lib/i18n";

export default async function DishesPage() {
  const profile = await requireProfile();
  const dishes = await fetchDishes();

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500">{t(profile.locale, "dishes.subtitle")}</p>
      <DishesView dishes={dishes} editable={canEdit(profile.role)} />
    </div>
  );
}
