import type { Equipment } from "../types.js";

export function formatInventoryItem(item: Equipment): string {
  if (item.attack !== undefined) {
    return `${item.name} (${item.attack} ATK)`;
  }

  if (item.hp !== undefined) {
    return `${item.name} (${item.hp} HP)`;
  }

  if (item.type !== undefined) {
    return `${item.name} (${item.type})`;
  }

  return item.name;
}

export function formatInventory(items: Equipment[]): string {
  return items.map(formatInventoryItem).join("\n");
}
