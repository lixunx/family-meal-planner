"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createDish, fetchDishes, updateDish } from "@/lib/data/meals";
import { findSimilarDishes } from "@/lib/dishes/similarity";
import type { DishTag, MealSlot } from "@/lib/types";
import { canEdit } from "@/lib/types";

export async function createLibraryDishAction(
  name: string,
  tags: DishTag[],
  mealTypes: MealSlot[],
  forceCreate = false
) {
  const profile = await requireProfile();
  if (!canEdit(profile.role)) {
    return { error: "Read-only access" };
  }

  const trimmed = name.trim();
  if (!trimmed) return { error: "Name required" };
  if (tags.length === 0) return { error: "Select at least one tag" };
  if (mealTypes.length === 0) return { error: "Select at least one meal" };

  const existingDishes = await fetchDishes();
  const similar = findSimilarDishes(existingDishes, trimmed);

  if (!forceCreate && similar.length > 0) {
    return {
      error: "similar_dish_exists",
      similarDishes: similar.map(({ dish, score }) => ({
        id: dish.id,
        name: dish.name,
        score,
      })),
    };
  }

  const dish = await createDish(trimmed, mealTypes, tags, profile.id);
  if (!dish) return { error: "Failed to create dish" };

  revalidatePath("/dishes");
  revalidatePath("/meals");
  return { success: true };
}

export async function updateLibraryDishAction(
  id: string,
  name: string,
  tags: DishTag[],
  mealTypes: MealSlot[]
) {
  const profile = await requireProfile();
  if (!canEdit(profile.role)) {
    return { error: "Read-only access" };
  }

  const trimmed = name.trim();
  if (!trimmed) return { error: "Name required" };
  if (tags.length === 0) return { error: "Select at least one tag" };
  if (mealTypes.length === 0) return { error: "Select at least one meal" };

  const existingDishes = await fetchDishes();
  const similar = findSimilarDishes(existingDishes, trimmed).filter(
    ({ dish }) => dish.id !== id
  );
  if (similar.length > 0) {
    return { error: "similar_dish_exists" };
  }

  const dish = await updateDish(id, trimmed, mealTypes, tags);
  if (!dish) return { error: "Failed to update dish" };

  revalidatePath("/dishes");
  revalidatePath("/meals");
  return { success: true, dish };
}
