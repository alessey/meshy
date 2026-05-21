import worldMap from "../world/map.js";
import { EVENT_ACTIONS, getCommandLabels, getDisplayActions } from "../game/commands.js";
import { gameMessage, plainMessage } from "../game/results.js";
import { itemPrompt, monsterPrompt, potionPrompt, TEXT } from "../game/text.js";
import type { Player } from "../game/player.js";
import type { Location, Encounter, Equipment } from "../types.js";
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
    case "potion":
      return gameMessage(potionPrompt(event.potion), actions);
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
      `You wake up in a forest clearing to find your village in ash. Rumour says Malachar, the God-Eaten King, consumed the Relic of the Sunken God and has been twisting the land ever since.`,
    ),
    plainMessage(
      `You must cross the realm, gather weapons and armour, unlock his citadel, and end his reign.`,
    ),
    inventoryMessage(player),
  ];
}

export function inventoryMessage(player: Player) {
  const message = ["Inventory:"];

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

function formatInventoryItem(item: Equipment): string {
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
