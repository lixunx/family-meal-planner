import { requireProfile } from "@/lib/auth";
import { fetchInventory } from "@/lib/data/meals";
import { InventoryView } from "@/components/inventory/inventory-view";
import { canEdit } from "@/lib/types";

export default async function InventoryPage() {
  const profile = await requireProfile();
  const items = await fetchInventory();
  const editable = canEdit(profile.role);

  return <InventoryView items={items} editable={editable} />;
}
