import type { Equipment } from "../types.js";

export function formatInventoryItem(item: Equipment): string {
  if ("attack" in item) {
    return `${item.name} (${item.attack} ATK)`;
  }

  if ("hp" in item) {
    return `${item.name} (${item.hp} HP)`;
  }

  return item.name;
}

export function formatInventory(items: Equipment[]): string {
  return items.map(formatInventoryItem).join("\n");
}
