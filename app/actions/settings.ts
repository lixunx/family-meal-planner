"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import {
  addAllowlistMember,
  deleteInventoryItem,
  removeAllowlistMember,
  updateProfileSettings,
  upsertInventoryItem,
} from "@/lib/data/settings";
import { canEdit, canManageFamily, type InventoryCategory } from "@/lib/types";

export async function updateSettingsAction(formData: FormData) {
  const profile = await requireProfile();
  const locale = formData.get("locale") as string;
  const timezone = formData.get("timezone") as string;

  await updateProfileSettings(profile.id, { locale, timezone });
  revalidatePath("/settings");
  revalidatePath("/meals");
  revalidatePath("/inventory");
  return { success: true };
}

export async function addFamilyMemberAction(formData: FormData) {
  const profile = await requireProfile();
  if (!canManageFamily(profile.role)) {
    return { error: "Not authorized" };
  }

  const email = (formData.get("email") as string).trim().toLowerCase();
  const role = formData.get("role") as string;

  if (!email) return { error: "Email required" };

  const ok = await addAllowlistMember(email, role, profile.id);
  if (!ok) return { error: "Failed to add member" };

  revalidatePath("/settings");
  return { success: true };
}

export async function removeFamilyMemberAction(id: string) {
  const profile = await requireProfile();
  if (!canManageFamily(profile.role)) {
    return { error: "Not authorized" };
  }

  await removeAllowlistMember(id);
  revalidatePath("/settings");
  return { success: true };
}

export async function upsertInventoryAction(formData: FormData) {
  const profile = await requireProfile();
  if (!canEdit(profile.role)) {
    return { error: "Read-only access" };
  }

  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string).trim();
  const category = formData.get("category") as InventoryCategory;
  const quantityStr = formData.get("quantity") as string;
  const unit = (formData.get("unit") as string).trim() || null;

  if (!name) return { error: "Name required" };

  const quantity = quantityStr ? parseFloat(quantityStr) : null;

  const ok = await upsertInventoryItem(
    { id: id || undefined, name, category, quantity, unit },
    profile.id
  );

  if (!ok) return { error: "Failed to save" };

  revalidatePath("/inventory");
  return { success: true };
}

export async function deleteInventoryAction(id: string) {
  const profile = await requireProfile();
  if (!canEdit(profile.role)) {
    return { error: "Read-only access" };
  }

  await deleteInventoryItem(id);
  revalidatePath("/inventory");
  return { success: true };
}

export async function signOutAction() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase.auth.signOut();
}
