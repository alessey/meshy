import type { Equipment, Monster, Potion, MonsterReward } from "../types.js";

export const TEXT = {
  INVENTORY_TITLE: "Inventory:",
  UNKNOWN_COMMAND: "Unknown command.",
  YOU_DIED: "You died!",
  WAITING_EVENT: "An event is waiting.",
};

export function inventoryText(inventory: string): string {
  return `${TEXT.INVENTORY_TITLE}\n${inventory}`;
}

export function itemPrompt(item: Equipment): string {
  return `Found ${item.name} (${itemStat(item)}). (T)ake or (D)iscard?`;
}

export function monsterPrompt(monster: Monster): string {
  return `A ${monster.name}, HP: ${monster.hp} appears! (F)ight or (R)un?`;
}

export function potionPrompt(potion: Potion): string {
  return `You found a ${potion.name}. (U)se or (D)iscard?`;
}

export function combatRoundText(
  monster: Monster,
  playerDamage: number,
  monsterDamage: number,
): string {
  return `You hit ${monster.name} for ${playerDamage}. ${monster.name} hits you for ${monsterDamage}. `;
}

export function monsterDefeatedText(combatMessage: string, monster: Monster): string {
  return `${combatMessage}${monster.name} is defeated!`;
}

export function monsterRewardText(reward: MonsterReward): string {
  const levelText = reward.didLevelUp ? ` Level up! You are now level ${reward.level}.` : "";
  return `+${reward.xp} XP.${levelText}`;
}

export function lootDropText(item: Equipment): string {
  return `It dropped ${item.name} (${itemStat(item)}). (T)ake or (D)iscard?`;
}

export function combatStatusText(combatMessage: string, player: any, monster: Monster): string {
  return `${combatMessage}Your HP: ${player.hp}. Monster HP: ${monster.hp}. (F)ight or (R)un?`;
}

function itemStat(item: Equipment): string {
  return "attack" in item ? `${item.attack} ATK` : `${item.hp} HP`;
}
