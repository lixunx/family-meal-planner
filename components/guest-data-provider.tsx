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
import type { InventoryItem, MealPlanWithItems } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_TIMEZONE } from "@/lib/constants";
import { getTomorrowDate } from "@/lib/utils";

interface GuestDataState {
  tomorrowPlan: MealPlanWithItems | null;
  history: MealPlanWithItems[];
  inventory: InventoryItem[];
}

interface GuestDataContextValue extends GuestDataState {
  refreshAll: () => Promise<void>;
}

const GuestDataContext = createContext<GuestDataContextValue | null>(null);

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

function getGuestTomorrowDate(): string {
  return getTomorrowDate(DEFAULT_TIMEZONE);
}

export function GuestDataProvider({
  initial,
  children,
}: {
  initial: GuestDataState;
  children: ReactNode;
}) {
  const [state, setState] = useState(initial);

  useEffect(() => {
    setState(initial);
  }, [initial]);

  const refreshAll = useCallback(async () => {
    const supabase = createClient();
    const tomorrow = getGuestTomorrowDate();

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

    const { data: inventory } = await supabase
      .from("inventory_items")
      .select("*")
      .order("name");

    setState({
      tomorrowPlan,
      history,
      inventory: (inventory ?? []) as InventoryItem[],
    });
  }, []);

  const value = useMemo(
    () => ({ ...state, refreshAll }),
    [state, refreshAll]
  );

  return (
    <GuestDataContext.Provider value={value}>
      {children}
    </GuestDataContext.Provider>
  );
}

export function useGuestData(): GuestDataContextValue {
  const ctx = useContext(GuestDataContext);
  if (!ctx) throw new Error("useGuestData must be used within GuestDataProvider");
  return ctx;
}
