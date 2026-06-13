import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_MEAL_CONFIG,
  normalizeMealConfig,
} from "@/lib/meal-config/defaults";
import type { MealConfig } from "@/lib/types";

export async function fetchMealConfig(): Promise<MealConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meal_config")
    .select("config")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("fetchMealConfig:", error.message);
    return DEFAULT_MEAL_CONFIG;
  }

  if (!data?.config) return DEFAULT_MEAL_CONFIG;
  return normalizeMealConfig(data.config);
}

export async function updateMealConfig(
  config: MealConfig
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("meal_config").upsert(
    {
      id: 1,
      config,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("updateMealConfig:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
