"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import {
  createDish,
  fetchDishes,
  fetchInventory,
  fetchMealHistory,
  saveMealPlan,
} from "@/lib/data/meals";
import { fetchMealConfig } from "@/lib/data/meal-config";
import { recommendFullDay } from "@/lib/recommendations/engine";
import { findSimilarDishes } from "@/lib/dishes/similarity";
import type { DishTag, MealSlot } from "@/lib/types";
import { getTomorrowDate } from "@/lib/utils";
import { canEdit } from "@/lib/types";

export async function generateRecommendationAction(existingPlanId?: string) {
  const profile = await requireProfile();
  if (!canEdit(profile.role)) {
    return { error: "Read-only access" };
  }

  const tomorrow = getTomorrowDate(profile.timezone);
  const dishes = await fetchDishes();
  const history = await fetchMealHistory(profile.timezone);
  const inventory = await fetchInventory();
  const mealConfig = await fetchMealConfig();

  const recommendations = await recommendFullDay(
    dishes,
    history,
    tomorrow,
    { inventory, mealConfig }
  );

  const items: {
    meal_slot: MealSlot;
    dish_id: string;
    sort_order: number;
  }[] = [];

  for (const slot of ["breakfast", "lunch", "dinner"] as MealSlot[]) {
    recommendations[slot].forEach((dish, index) => {
      items.push({
        meal_slot: slot,
        dish_id: dish.id,
        sort_order: index,
      });
    });
  }

  const planId = await saveMealPlan(
    tomorrow,
    "draft",
    items,
    profile.id,
    existingPlanId
  );

  revalidatePath("/meals");
  return { planId };
}

export async function confirmPlanAction(planId: string) {
  const profile = await requireProfile();
  if (!canEdit(profile.role)) {
    return { error: "Read-only access" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase
    .from("meal_plans")
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .eq("id", planId);

  revalidatePath("/meals");
  return { success: true };
}

export async function addExistingDishToPlanAction(
  planId: string,
  slot: MealSlot,
  dishId: string
) {
  const profile = await requireProfile();
  if (!canEdit(profile.role)) {
    return { error: "Read-only access" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("meal_plan_items")
    .select("sort_order")
    .eq("plan_id", planId)
    .eq("meal_slot", slot)
    .order("sort_order", { ascending: false })
    .limit(1);

  const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  await supabase.from("meal_plan_items").insert({
    plan_id: planId,
    meal_slot: slot,
    dish_id: dishId,
    sort_order: sortOrder,
  });

  revalidatePath("/meals");
  return { success: true };
}

export async function addDishToPlanAction(
  planId: string,
  slot: MealSlot,
  dishName: string,
  tags: DishTag[],
  forceCreate = false
) {
  const profile = await requireProfile();
  if (!canEdit(profile.role)) {
    return { error: "Read-only access" };
  }

  const existingDishes = await fetchDishes();
  const similar = findSimilarDishes(existingDishes, dishName);

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

  const dish = await createDish(
    dishName,
    [slot],
    tags,
    profile.id
  );

  if (!dish) return { error: "Failed to create dish" };

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("meal_plan_items")
    .select("sort_order")
    .eq("plan_id", planId)
    .eq("meal_slot", slot)
    .order("sort_order", { ascending: false })
    .limit(1);

  const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  await supabase.from("meal_plan_items").insert({
    plan_id: planId,
    meal_slot: slot,
    dish_id: dish.id,
    sort_order: sortOrder,
  });

  revalidatePath("/meals");
  return { success: true };
}

export async function removeDishFromPlanAction(itemId: string) {
  const profile = await requireProfile();
  if (!canEdit(profile.role)) {
    return { error: "Read-only access" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase.from("meal_plan_items").delete().eq("id", itemId);

  revalidatePath("/meals");
  return { success: true };
}

export async function swapDishAction(
  itemId: string,
  newDishId: string
) {
  const profile = await requireProfile();
  if (!canEdit(profile.role)) {
    return { error: "Read-only access" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase
    .from("meal_plan_items")
    .update({ dish_id: newDishId })
    .eq("id", itemId);

  revalidatePath("/meals");
  return { success: true };
}
