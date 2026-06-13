"use client";

import { useAppData } from "@/components/app-data-provider";
import { InventoryView } from "@/components/inventory/inventory-view";
import { canEdit } from "@/lib/types";

export function InventoryPageContent() {
  const { profile, inventory } = useAppData();

  return (
    <InventoryView items={inventory} editable={canEdit(profile.role)} />
  );
}
