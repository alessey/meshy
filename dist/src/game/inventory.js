export function formatInventoryItem(item) {
    if ("attack" in item) {
        return `${item.name} (${item.attack} ATK)`;
    }
    if ("hp" in item) {
        return `${item.name} (${item.hp} HP)`;
    }
    return item.name;
}
export function formatInventory(items) {
    return items.map(formatInventoryItem).join("\n");
}
