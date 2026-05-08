import { COMMANDS, EVENT_ACTIONS, getCommandLabels } from "../game/commands.js";
import { gameMessage, result } from "../game/results.js";
import { itemPrompt } from "../game/text.js";
import { getLocation, locationSummaryMessage } from "./presenters.js";
import type { Player } from "../game/player.js";
import type { ItemEncounter, GameOutcome, ItemCommand, Weapon, Armor, Item } from "../types.js";

export function handleItemEncounter(
  player: Player,
  command: ItemCommand,
  event: ItemEncounter,
): GameOutcome {
  const location = getLocation(player);

  if (command === COMMANDS.TAKE) {
    if (event.item.attack !== undefined) {
      player.weapon = event.item as Weapon;
    } else if (event.item.hp !== undefined) {
      player.armor = event.item as Armor;
    } else if (event.item.type !== undefined) {
      player.items.push(event.item as Item);
    }

    player.encounter = null;
    return result([locationSummaryMessage(location)], { shouldSave: true });
  }

  if (command === COMMANDS.DISCARD) {
    player.encounter = null;
    return result([locationSummaryMessage(location)], { shouldSave: true });
  }

  return result([gameMessage(itemPrompt(event.item), getCommandLabels(EVENT_ACTIONS.item))]);
}
