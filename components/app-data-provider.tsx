"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Dish,
  FamilyAllowlist,
  InventoryItem,
  MealConfig,
  MealPlanWithItems,
  Profile,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getTomorrowDate } from "@/lib/utils";
import { normalizeMealConfig } from "@/lib/meal-config/defaults";

export interface AppDataState {
  profile: Profile;
  dishes: Dish[];
  inventory: InventoryItem[];
  tomorrowPlan: MealPlanWithItems | null;
  history: MealPlanWithItems[];
  mealConfig: MealConfig;
  allowlist: FamilyAllowlist[];
}

interface AppDataContextValue extends AppDataState {
  refreshDishes: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  refreshMeals: () => Promise<void>;
  refreshAll: () => Promise<void>;
  setDishes: (dishes: Dish[]) => void;
  setInventory: (items: InventoryItem[]) => void;
  setTomorrowPlan: (plan: MealPlanWithItems | null) => void;
  setHistory: (plans: MealPlanWithItems[]) => void;
  setMealConfig: (config: MealConfig) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

async function fetchPlanWithItemsClient(
  supabase: ReturnType<typeof createClient>,
  planId: string
): Promise<MealPlanWithItems | null> {
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

  return { ...plan, items: items ?? [] } as MealPlanWithItems;
}

export function AppDataProvider({
  initial,
  children,
}: {
  initial: AppDataState;
  children: ReactNode;
}) {
  const [state, setState] = useState(initial);

  useEffect(() => {
    setState(initial);
  }, [initial]);

  const refreshDishes = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("dishes").select("*").order("name");
    if (data) setState((s) => ({ ...s, dishes: data as Dish[] }));
  }, []);

  const refreshInventory = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("inventory_items")
      .select("*")
      .order("name");
    if (data) setState((s) => ({ ...s, inventory: data as InventoryItem[] }));
  }, []);

  const refreshMeals = useCallback(async () => {
    const supabase = createClient();
    const tomorrow = getTomorrowDate(state.profile.timezone);

    const { data: tomorrowRow } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("plan_date", tomorrow)
      .maybeSingle();

    let tomorrowPlan: MealPlanWithItems | null = null;
    if (tomorrowRow) {
      tomorrowPlan = await fetchPlanWithItemsClient(supabase, tomorrowRow.id);
    }

    const { data: planRows } = await supabase
      .from("meal_plans")
      .select("*")
      .lt("plan_date", tomorrow)
      .order("plan_date", { ascending: false })
      .limit(20);

    const history: MealPlanWithItems[] = [];
    for (const row of planRows ?? []) {
      const full = await fetchPlanWithItemsClient(supabase, row.id);
      if (full) history.push(full);
    }

    setState((s) => ({ ...s, tomorrowPlan, history }));
  }, [state.profile.timezone]);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshDishes(), refreshInventory(), refreshMeals()]);
  }, [refreshDishes, refreshInventory, refreshMeals]);

  const value = useMemo(
    () => ({
      ...state,
      refreshDishes,
      refreshInventory,
      refreshMeals,
      refreshAll,
      setDishes: (dishes: Dish[]) => setState((s) => ({ ...s, dishes })),
      setInventory: (items: InventoryItem[]) =>
        setState((s) => ({ ...s, inventory: items })),
      setTomorrowPlan: (plan: MealPlanWithItems | null) =>
        setState((s) => ({ ...s, tomorrowPlan: plan })),
      setHistory: (plans: MealPlanWithItems[]) =>
        setState((s) => ({ ...s, history: plans })),
      setMealConfig: (config: MealConfig) =>
        setState((s) => ({ ...s, mealConfig: config })),
    }),
    [state, refreshDishes, refreshInventory, refreshMeals, refreshAll]
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export function useOptionalAppData(): AppDataContextValue | null {
  return useContext(AppDataContext);
}

export { AppDataContext };

export async function fetchMealConfigClient(): Promise<MealConfig> {
  const supabase = createClient();
  const { data } = await supabase
    .from("meal_config")
    .select("config")
    .eq("id", 1)
    .maybeSingle();
  return normalizeMealConfig(data?.config);
}
