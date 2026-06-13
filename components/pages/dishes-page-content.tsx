"use client";

import { useAppData } from "@/components/app-data-provider";
import { DishesView } from "@/components/dishes/dishes-view";
import { useT } from "@/components/locale-provider";
import { canEdit } from "@/lib/types";

export function DishesPageContent() {
  const tr = useT();
  const { dishes, profile } = useAppData();

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500">{tr("dishes.subtitle")}</p>
      <DishesView dishes={dishes} editable={canEdit(profile.role)} />
    </div>
  );
}
