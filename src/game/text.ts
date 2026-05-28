import type { Loot, Monster, MonsterReward } from "../types.js";
import { type Player } from "./player.js";

export const TEXT = {
  INVENTORY_TITLE: "Inventory:",
  UNKNOWN_COMMAND: "Unknown command, type /help for more info.",
  YOU_DIED: "You died!",
  WAITING_EVENT: "An event is waiting.",
  YOU_WON: "You have defeated the final boss! Congratulations, you win!",
  PLAY_AGAIN: "Type /play to start a new game.",
};

export function inventoryText(inventory: string): string {
  return `${TEXT.INVENTORY_TITLE}\n${inventory}`;
}

export function itemPrompt(item: Loot): string {
  return `Found ${item.name} (${itemStat(item)}). (T)ake or (D)iscard?`;
}

export function monsterPrompt(monster: Monster): string {
  return `A ${monster.name}, HP: ${monster.hp}, ATK: ${monster.attack}, appears! (F)ight or (R)un?`;
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

export function lootDropText(item: Loot): string {
  const stat = itemStat(item);
  const actions = itemActions(item);
  return `It dropped ${item.name} ${stat ? `(${stat})` : ""}. ${actions}`;
}

function itemActions(item: Loot): string {
  switch (item.type) {
    case "item":
    case "weapon":
    case "armor":
      return "(T)ake or (D)iscard";
    case "potion":
      return "(U)se or (D)iscard";
    default:
      return "";
  }
}

export function combatStatusText(combatMessage: string, player: Player, monster: Monster): string {
  return `${combatMessage}Your HP: ${player.hp}. Monster HP: ${monster.hp}. (F)ight or (R)un?`;
}

function itemStat(item: Loot): string {
  switch (item.type) {
    case "weapon":
      return `${item.attack} ATK`;
    case "armor":
      return `${item.hp} HP`;
    case "potion":
      return `Heals ${item.heal} HP`;
    default:
      return item.type;
  }
}

export function requirementText(itemName: string): string {
  return `You need a ${itemName} to pass this way.`;
}
