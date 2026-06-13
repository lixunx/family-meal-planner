import { createClient } from "@/lib/supabase/server";
import type {
  Dish,
  InventoryItem,
  MealPlanItem,
  MealPlanWithItems,
  MealSlot,
} from "@/lib/types";
import { getTomorrowDate } from "@/lib/utils";

export async function fetchDishes(): Promise<Dish[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dishes")
    .select("*")
    .order("name");
  return (data ?? []) as Dish[];
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inventory_items")
    .select("*")
    .order("name");
  return (data ?? []) as InventoryItem[];
}

export async function fetchPlanWithItems(
  planId: string
): Promise<MealPlanWithItems | null> {
  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!plan) return null;

  const { data: items } = await supabase
    .from("meal_plan_items")
    .select("*, dish:dishes(*)")
    .eq("plan_id", planId)
    .order("sort_order");

  return {
    ...(plan as MealPlanWithItems),
    items: (items ?? []) as MealPlanItem[],
  };
}

export async function fetchPlanByDate(
  date: string
): Promise<MealPlanWithItems | null> {
  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("plan_date", date)
    .maybeSingle();

  if (!plan) return null;
  return fetchPlanWithItems(plan.id);
}

export async function fetchRecentPlans(
  beforeDate: string,
  limit = 30
): Promise<MealPlanWithItems[]> {
  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("meal_plans")
    .select("*")
    .lt("plan_date", beforeDate)
    .order("plan_date", { ascending: false })
    .limit(limit);

  if (!plans?.length) return [];

  const result: MealPlanWithItems[] = [];
  for (const plan of plans) {
    const full = await fetchPlanWithItems(plan.id);
    if (full) result.push(full);
  }
  return result;
}

export async function fetchTomorrowPlan(
  timezone: string
): Promise<MealPlanWithItems | null> {
  const tomorrow = getTomorrowDate(timezone);
  return fetchPlanByDate(tomorrow);
}

export async function fetchMealHistory(
  timezone: string,
  limit = 20
): Promise<MealPlanWithItems[]> {
  const tomorrow = getTomorrowDate(timezone);
  return fetchRecentPlans(tomorrow, limit);
}

export async function createDish(
  name: string,
  mealTypes: MealSlot[],
  tags: string[],
  userId: string
): Promise<Dish | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dishes")
    .insert({
      name,
      meal_types: mealTypes,
      tags,
      created_by: userId,
    })
    .select()
    .single();
  return data as Dish | null;
}

export async function updateDish(
  id: string,
  name: string,
  mealTypes: MealSlot[],
  tags: string[]
): Promise<Dish | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dishes")
    .update({
      name,
      meal_types: mealTypes,
      tags,
    })
    .eq("id", id)
    .select()
    .single();
  return data as Dish | null;
}

export async function saveMealPlan(
  planDate: string,
  status: "draft" | "confirmed",
  items: { meal_slot: MealSlot; dish_id: string; sort_order: number }[],
  userId: string,
  existingPlanId?: string
): Promise<string | null> {
  const supabase = await createClient();

  let planId = existingPlanId;

  if (planId) {
    await supabase
      .from("meal_plans")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", planId);
    await supabase.from("meal_plan_items").delete().eq("plan_id", planId);
  } else {
    const { data: plan } = await supabase
      .from("meal_plans")
      .insert({
        plan_date: planDate,
        status,
        created_by: userId,
      })
      .select()
      .single();
    planId = plan?.id;
  }

  if (!planId) return null;

  if (items.length > 0) {
    await supabase.from("meal_plan_items").insert(
      items.map((item) => ({
        plan_id: planId,
        meal_slot: item.meal_slot,
        dish_id: item.dish_id,
        sort_order: item.sort_order,
      }))
    );
  }

  return planId;
}
