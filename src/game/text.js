export const TEXT = {
  INVENTORY_TITLE: "Inventory:",
  UNKNOWN_COMMAND: "Unknown command.",
  YOU_DIED: "You died!",
  WAITING_EVENT: "An event is waiting.",
};

export function inventoryText(inventory) {
  return `${TEXT.INVENTORY_TITLE}\n${inventory}`;
}

export function itemPrompt(item) {
  return `Found ${item.name} (${itemStat(item)}). (T)ake or (D)iscard?`;
}

export function monsterPrompt(monster) {
  return `A ${monster.name} appears! (F)ight or (R)un?`;
}

export function potionPrompt(potion) {
  return `You found a ${potion.name}. (U)se or (D)iscard?`;
}

export function combatRoundText(monster, playerDamage, monsterDamage) {
  return `You hit ${monster.name} for ${playerDamage}. ${monster.name} hits you for ${monsterDamage}. `;
}

export function monsterDefeatedText(combatMessage, monster, location) {
  return `${combatMessage}${monster.name} is defeated! ${location.desc}`;
}

export function combatStatusText(combatMessage, player, monster) {
  return `${combatMessage}Your HP: ${player.hp}. Monster HP: ${monster.hp}. (F)ight or (R)un?`;
}

function itemStat(item) {
  return "attack" in item ? `${item.attack} ATK` : `${item.hp} HP`;
}
