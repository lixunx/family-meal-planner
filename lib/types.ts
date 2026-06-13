export type UserRole = "admin" | "editor" | "viewer";

export type MealSlot = "breakfast" | "lunch" | "dinner";

export type DishTag =
  | "veg"
  | "meat"
  | "seafood"
  | "soup"
  | "starch"
  | "other";

export type InventoryCategory = "veg" | "meat" | "seafood" | "other";

export type MealPlanStatus = "draft" | "confirmed";

export type Locale = "en" | "zh-CN";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  locale: Locale;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyAllowlist {
  id: string;
  email: string;
  role: UserRole;
  invited_by: string | null;
  created_at: string;
}

export interface Dish {
  id: string;
  name: string;
  meal_types: MealSlot[];
  tags: DishTag[];
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface MealPlan {
  id: string;
  plan_date: string;
  status: MealPlanStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealPlanItem {
  id: string;
  plan_id: string;
  meal_slot: MealSlot;
  dish_id: string;
  sort_order: number;
  dish?: Dish;
}

export interface MealPlanWithItems extends MealPlan {
  items: MealPlanItem[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number | null;
  unit: string | null;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

export const MEAL_SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner"];

export const DISH_TAGS: DishTag[] = [
  "veg",
  "meat",
  "seafood",
  "soup",
  "starch",
  "other",
];

export const INVENTORY_CATEGORIES: InventoryCategory[] = [
  "veg",
  "meat",
  "seafood",
  "other",
];

export const USER_ROLES: UserRole[] = ["admin", "editor", "viewer"];

export function canEdit(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

export function canManageFamily(role: UserRole): boolean {
  return role === "admin";
}

export interface MealSlotConfig {
  totalCount: number;
  tagMinimums: {
    veg: number;
    meat: number;
    soup: number;
  };
}

export type MealConfig = Record<MealSlot, MealSlotConfig>;
