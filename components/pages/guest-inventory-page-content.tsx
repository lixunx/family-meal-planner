"use client";

import { useGuestData } from "@/components/guest-data-provider";
import { InventoryView } from "@/components/inventory/inventory-view";

export function GuestInventoryPageContent() {
  const { inventory } = useGuestData();
  return <InventoryView items={inventory} editable={false} />;
}
