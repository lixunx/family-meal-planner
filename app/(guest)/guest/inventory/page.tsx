import { fetchGuestInventory } from "@/lib/data/guest";
import { InventoryView } from "@/components/inventory/inventory-view";

export default async function GuestInventoryPage() {
  const items = await fetchGuestInventory();

  return <InventoryView items={items} editable={false} />;
}
