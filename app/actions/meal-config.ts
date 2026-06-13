"use server";

import { requireProfile } from "@/lib/auth";
import { updateMealConfig } from "@/lib/data/meal-config";
import { normalizeMealConfig } from "@/lib/meal-config/defaults";
import { canEdit } from "@/lib/types";

export async function updateMealConfigAction(configJson: string) {
  try {
    const profile = await requireProfile();
    if (!canEdit(profile.role)) {
      return { error: "Read-only access" };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(configJson);
    } catch {
      return { error: "Invalid config" };
    }

    const config = normalizeMealConfig(parsed);
    const result = await updateMealConfig(config);
    if (!result.ok) {
      return { error: result.error ?? "Failed to save" };
    }

    // Client cache is updated in the UI; no revalidatePath here to avoid
    // layout re-fetch conflicting with the server action response.
    return { success: true as const };
  } catch (err) {
    if (isNextNavigationError(err)) throw err;
    console.error("updateMealConfigAction:", err);
    return { error: "Failed to save meal planning settings" };
  }
}

function isNextNavigationError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: string }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_")
  );
}
