"use client";

import { useState, useTransition } from "react";
import { Camera, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale, useT } from "@/components/locale-provider";
import {
  deleteInventoryAction,
  upsertInventoryAction,
} from "@/app/actions/settings";
import { inventoryCategoryLabel } from "@/lib/i18n";
import type { InventoryCategory, InventoryItem, Locale } from "@/lib/types";
import { INVENTORY_CATEGORIES } from "@/lib/types";

export function InventoryView({
  items,
  editable,
}: {
  items: InventoryItem[];
  editable: boolean;
}) {
  const locale = useLocale();
  const tr = useT();

  const grouped = INVENTORY_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = items.filter((i) => i.category === cat);
      return acc;
    },
    {} as Record<InventoryCategory, InventoryItem[]>
  );

  return (
    <div className="space-y-4">
      {editable && <QuickAddForm locale={locale} />}

      <Button variant="outline" className="w-full" disabled>
        <Camera className="h-4 w-4" />
        {tr("inventory.photoScan")} ({tr("inventory.comingSoon")})
      </Button>

      {INVENTORY_CATEGORIES.map((category) => (
        <Card key={category}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {inventoryCategoryLabel(locale, category)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {grouped[category].length === 0 ? (
              <p className="text-sm text-stone-400">{tr("inventory.empty")}</p>
            ) : (
              <ul className="space-y-2">
                {grouped[category].map((item) => (
                  <InventoryRow
                    key={item.id}
                    item={item}
                    editable={editable}
                  />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QuickAddForm({ locale }: { locale: Locale }) {
  const tr = useT();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("veg");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("name", name);
    formData.set("category", category);
    formData.set("quantity", quantity);
    formData.set("unit", unit);
    startTransition(async () => {
      await upsertInventoryAction(formData);
      setName("");
      setQuantity("");
      setUnit("");
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{tr("inventory.add")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tr("inventory.name")}
            required
          />
          <div className="flex flex-wrap gap-2">
            {INVENTORY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  category === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {inventoryCategoryLabel(locale, cat)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={tr("inventory.quantity")}
              className="flex-1"
            />
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder={tr("inventory.unit")}
              className="flex-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending || !name}>
            {tr("inventory.add")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function InventoryRow({
  item,
  editable,
}: {
  item: InventoryItem;
  editable: boolean;
}) {
  const tr = useT();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(
    item.quantity?.toString() ?? ""
  );
  const [unit, setUnit] = useState(item.unit ?? "");

  function handleSave() {
    const formData = new FormData();
    formData.set("id", item.id);
    formData.set("name", name);
    formData.set("category", item.category);
    formData.set("quantity", quantity);
    formData.set("unit", unit);
    startTransition(async () => {
      await upsertInventoryAction(formData);
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <li className="space-y-2 rounded-xl bg-stone-50 p-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex gap-2">
          <Input
            type="number"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={tr("inventory.quantity")}
          />
          <Input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder={tr("inventory.unit")}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={pending}>
            {tr("common.save")}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setEditing(false)}
          >
            {tr("common.cancel")}
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2">
      <div>
        <span className="font-medium">{item.name}</span>
        {(item.quantity != null || item.unit) && (
          <span className="ml-2 text-sm text-stone-500">
            {item.quantity ?? ""} {item.unit ?? ""}
          </span>
        )}
      </div>
      {editable && (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-stone-400 hover:text-red-600"
            onClick={() =>
              startTransition(() => {
                void deleteInventoryAction(item.id);
              })
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </li>
  );
}
