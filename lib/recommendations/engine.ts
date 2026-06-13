import type {
  Dish,
  DishTag,
  InventoryItem,
  MealPlanWithItems,
  MealSlot,
} from "@/lib/types";
import { addDays } from "@/lib/utils";

export interface RecommendOptions {
  repeatWindow?: Partial<Record<MealSlot, number>>;
  inventory?: InventoryItem[];
  llmSuggest?: (
    slot: MealSlot,
    candidates: Dish[]
  ) => Promise<Dish[] | null>;
}

const DEFAULT_REPEAT_WINDOW: Record<MealSlot, number> = {
  breakfast: 3,
  lunch: 5,
  dinner: 5,
};

const DINNER_TEMPLATE = {
  veg: [1, 2] as [number, number],
  protein: 1,
  soup: 1,
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getRecentDishIds(
  recentPlans: MealPlanWithItems[],
  slot: MealSlot,
  beforeDate: string,
  windowDays: number
): Set<string> {
  const cutoff = addDays(beforeDate, -windowDays);
  const ids = new Set<string>();

  for (const plan of recentPlans) {
    if (plan.plan_date >= beforeDate) continue;
    if (plan.plan_date < cutoff) continue;
    for (const item of plan.items) {
      if (item.meal_slot === slot) {
        ids.add(item.dish_id);
      }
    }
  }

  return ids;
}

function filterBySlot(dishes: Dish[], slot: MealSlot): Dish[] {
  return dishes.filter((d) => d.meal_types.includes(slot));
}

function filterByTags(dishes: Dish[], tags: DishTag[]): Dish[] {
  return dishes.filter((d) => d.tags.some((t) => tags.includes(t)));
}

function excludeIds(dishes: Dish[], exclude: Set<string>): Dish[] {
  if (exclude.size === 0) return dishes;
  return dishes.filter((d) => !exclude.has(d.id));
}

function scoreDish(dish: Dish, inventory?: InventoryItem[]): number {
  if (!inventory?.length) return Math.random();
  const invNames = inventory.map((i) => i.name.toLowerCase());
  const dishName = dish.name.toLowerCase();
  const overlap = invNames.some(
    (n) => dishName.includes(n) || n.includes(dishName)
  );
  return overlap ? Math.random() + 10 : Math.random();
}

function pickBest(candidates: Dish[], inventory?: InventoryItem[]): Dish | null {
  if (candidates.length === 0) return null;
  const ranked = [...candidates].sort(
    (a, b) => scoreDish(b, inventory) - scoreDish(a, inventory)
  );
  return ranked[0];
}

function pickMultiple(
  candidates: Dish[],
  count: number,
  picked: Dish[],
  inventory?: InventoryItem[]
): Dish[] {
  const result: Dish[] = [];
  const usedIds = new Set(picked.map((d) => d.id));

  for (let i = 0; i < count; i++) {
    const pool = candidates.filter((d) => !usedIds.has(d.id));
    const choice = pickBest(pool, inventory);
    if (!choice) break;
    result.push(choice);
    usedIds.add(choice.id);
  }

  return result;
}

function recommendBreakfastOrLunch(
  slot: MealSlot,
  dishes: Dish[],
  recentPlans: MealPlanWithItems[],
  targetDate: string,
  windowDays: number,
  inventory?: InventoryItem[]
): Dish[] {
  const slotDishes = filterBySlot(dishes, slot);
  const recentIds = getRecentDishIds(recentPlans, slot, targetDate, windowDays);
  let pool = excludeIds(slotDishes, recentIds);

  if (pool.length < 2) {
    pool = slotDishes;
  }

  const count = slot === "breakfast" ? 2 : 3;
  const tags: DishTag[] = ["starch", "veg", "meat", "seafood", "other"];
  const picked: Dish[] = [];

  for (const tag of tags) {
    if (picked.length >= count) break;
    const tagPool = filterByTags(
      pool.filter((d) => !picked.some((p) => p.id === d.id)),
      [tag]
    );
    const choice = pickBest(tagPool, inventory);
    if (choice) picked.push(choice);
  }

  if (picked.length < count) {
    const extra = pickMultiple(
      pool,
      count - picked.length,
      picked,
      inventory
    );
    picked.push(...extra);
  }

  return picked.slice(0, count);
}

function recommendDinner(
  dishes: Dish[],
  recentPlans: MealPlanWithItems[],
  targetDate: string,
  windowDays: number,
  inventory?: InventoryItem[]
): Dish[] {
  const slotDishes = filterBySlot(dishes, "dinner");
  const recentIds = getRecentDishIds(
    recentPlans,
    "dinner",
    targetDate,
    windowDays
  );
  let pool = excludeIds(slotDishes, recentIds);

  if (pool.length < 3) {
    pool = slotDishes;
  }

  const picked: Dish[] = [];

  const vegCount =
    DINNER_TEMPLATE.veg[0] +
    Math.floor(Math.random() * (DINNER_TEMPLATE.veg[1] - DINNER_TEMPLATE.veg[0] + 1));
  const vegDishes = pickMultiple(
    filterByTags(pool, ["veg"]),
    vegCount,
    picked,
    inventory
  );
  picked.push(...vegDishes);

  const proteinTags: DishTag[] = shuffle(["meat", "seafood"]);
  let protein: Dish | null = null;
  for (const tag of proteinTags) {
    protein = pickBest(
      filterByTags(
        pool.filter((d) => !picked.some((p) => p.id === d.id)),
        [tag]
      ),
      inventory
    );
    if (protein) break;
  }
  if (protein) picked.push(protein);

  const soup = pickBest(
    filterByTags(
      pool.filter((d) => !picked.some((p) => p.id === d.id)),
      ["soup"]
    ),
    inventory
  );
  if (soup) picked.push(soup);

  if (picked.length < 3) {
    const extra = pickMultiple(pool, 4 - picked.length, picked, inventory);
    picked.push(...extra);
  }

  return picked.slice(0, 4);
}

export async function recommendMeal(
  slot: MealSlot,
  dishes: Dish[],
  recentPlans: MealPlanWithItems[],
  targetDate: string,
  options: RecommendOptions = {}
): Promise<Dish[]> {
  const windowDays =
    options.repeatWindow?.[slot] ?? DEFAULT_REPEAT_WINDOW[slot];
  const inventory = options.inventory;

  if (options.llmSuggest) {
    const slotDishes = filterBySlot(dishes, slot);
    const recentIds = getRecentDishIds(
      recentPlans,
      slot,
      targetDate,
      windowDays
    );
    const candidates = excludeIds(slotDishes, recentIds);
    const llmResult = await options.llmSuggest(
      slot,
      candidates.length > 0 ? candidates : slotDishes
    );
    if (llmResult && llmResult.length > 0) {
      if (slot === "dinner") {
        const hasVeg = llmResult.some((d) => d.tags.includes("veg"));
        const hasProtein = llmResult.some(
          (d) => d.tags.includes("meat") || d.tags.includes("seafood")
        );
        const hasSoup = llmResult.some((d) => d.tags.includes("soup"));
        if (hasVeg && hasProtein && hasSoup) return llmResult;
      } else {
        return llmResult;
      }
    }
  }

  if (slot === "dinner") {
    return recommendDinner(
      dishes,
      recentPlans,
      targetDate,
      windowDays,
      inventory
    );
  }

  return recommendBreakfastOrLunch(
    slot,
    dishes,
    recentPlans,
    targetDate,
    windowDays,
    inventory
  );
}

export async function recommendFullDay(
  dishes: Dish[],
  recentPlans: MealPlanWithItems[],
  targetDate: string,
  options: RecommendOptions = {}
): Promise<Record<MealSlot, Dish[]>> {
  const slots: MealSlot[] = ["breakfast", "lunch", "dinner"];
  const result = {} as Record<MealSlot, Dish[]>;

  for (const slot of slots) {
    result[slot] = await recommendMeal(
      slot,
      dishes,
      recentPlans,
      targetDate,
      options
    );
  }

  return result;
}

export function validateDinnerBalance(dishes: Dish[]): boolean {
  const veg = dishes.filter((d) => d.tags.includes("veg")).length;
  const protein = dishes.filter(
    (d) => d.tags.includes("meat") || d.tags.includes("seafood")
  ).length;
  const soup = dishes.filter((d) => d.tags.includes("soup")).length;
  return veg >= 1 && protein >= 1 && soup >= 1 && protein <= 2;
}
