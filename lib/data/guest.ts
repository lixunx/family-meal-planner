import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TIMEZONE } from "@/lib/constants";
import {
  fetchInventory,
  fetchMealHistory,
  fetchTomorrowPlan,
} from "@/lib/data/meals";

export async function fetchGuestTomorrowPlan() {
  return fetchTomorrowPlan(DEFAULT_TIMEZONE);
}

export async function fetchGuestMealHistory() {
  return fetchMealHistory(DEFAULT_TIMEZONE);
}

export async function fetchGuestInventory() {
  return fetchInventory();
}

export async function fetchGuestDishes() {
  const supabase = await createClient();
  const { data } = await supabase.from("dishes").select("*").order("name");
  return data ?? [];
}
