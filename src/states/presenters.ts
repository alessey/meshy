import worldMap from "../world/map.js";
import { EVENT_ACTIONS, getCommandLabels, getDisplayActions } from "../game/commands.js";
import { gameMessage, plainMessage } from "../game/results.js";
import { itemPrompt, monsterPrompt, TEXT } from "../game/text.js";
import type { Player } from "../game/player.js";
import type { Location, Encounter, Loot } from "../types.js";
import { getStartLocationKey } from "../world/utils.js";

export function getLocation(player: Player): Location {
  const loc = worldMap[player.location];
  if (loc) return loc;

  // fallback to start location or first available location if key is invalid (e.g. after death reset)
  return worldMap[getStartLocationKey()];
}

export function locationSummaryMessage(location: Location) {
  return gameMessage(location.desc, getDisplayActions(location.actions));
}

export function eventPromptMessage(event: Encounter, player: Player) {
  const actions = getCommandLabels(EVENT_ACTIONS[event.type]);

  switch (event.type) {
    case "item":
      return gameMessage(itemPrompt(event.item), actions);
    case "monster":
      return gameMessage(monsterPrompt(event.monster), actions);
    default:
      return gameMessage(TEXT.WAITING_EVENT, getDisplayActions(getLocation(player).actions));
  }
}

export function unknownCommandMessage(player: Player) {
  const location = getLocation(player);
  const actions = player.encounter
    ? getCommandLabels(EVENT_ACTIONS[player.encounter.type])
    : getDisplayActions(location.actions);

  return gameMessage(TEXT.UNKNOWN_COMMAND, actions);
}

export function helpMessage() {
  return plainMessage(`Available commands:
/play - start a new game (does not restart if already playing)
/i - show inventory
/retry - repeat last message
/help - show this message`);
}

export function playMessage(player: Player) {
  return [
    plainMessage(
      `You are a mercenary who rides into the Kingdom of Meshymoor to find it tearing itself apart. Varek the Ugly, once the realm's sorcerer, shattered the Crown of Binding and seized the throne.`,
    ),
    plainMessage(
      `Two fragments of the Crown were scattered as Varek fled. Recover them and you can unlock the Spire Gate and face him at the top of the Ashen Spire.`,
    ),
    inventoryMessage(player),
  ];
}

export function inventoryMessage(player: Player) {
  const message = ["Inventory [/i to view]:"];

  if (player.weapon) {
    message.push(`Weapon: ${formatInventoryItem(player.weapon)}`);
  }

  if (player.armor) {
    message.push(`Armor: ${formatInventoryItem(player.armor)}`);
  }

  if (player.items.length > 0) {
    message.push("Items:");
    player.items.forEach((item) => {
      message.push(`- ${formatInventoryItem(item)}`);
    });
  }

  return plainMessage(message.join("\n"));
}

function formatInventoryItem(item: Loot): string {
  switch (item.type) {
    case "weapon":
      return `${item.name} (${item.attack} ATK)`;
    case "armor":
      return `${item.name} (${item.hp} HP)`;
    case "potion":
      return `${item.name} (${item.heal} HEAL)`;
    case "item":
      return item.name;
    default:
      return "Unknown itemtype";
  }
}
