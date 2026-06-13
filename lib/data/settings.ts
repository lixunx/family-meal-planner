import { createClient } from "@/lib/supabase/server";
import type { FamilyAllowlist, InventoryCategory } from "@/lib/types";

export async function fetchAllowlist(): Promise<FamilyAllowlist[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("family_allowlist")
    .select("*")
    .order("email");
  return (data ?? []) as FamilyAllowlist[];
}

export async function addAllowlistMember(
  email: string,
  role: string,
  invitedBy: string
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("family_allowlist").insert({
    email: email.toLowerCase(),
    role,
    invited_by: invitedBy,
  });
  return !error;
}

export async function removeAllowlistMember(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("family_allowlist")
    .delete()
    .eq("id", id);
  return !error;
}

export async function updateProfileSettings(
  userId: string,
  updates: { locale?: string; timezone?: string }
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId);
  return !error;
}

export async function upsertInventoryItem(
  item: {
    id?: string;
    name: string;
    category: InventoryCategory;
    quantity: number | null;
    unit: string | null;
  },
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  if (item.id) {
    const { error } = await supabase
      .from("inventory_items")
      .update({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);
    return !error;
  }

  const { error } = await supabase.from("inventory_items").insert({
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    updated_by: userId,
  });
  return !error;
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", id);
  return !error;
}
