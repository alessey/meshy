import { COMMANDS, EVENT_ACTIONS, getCommandLabels } from "../game/commands.js";
import { gameMessage, result } from "../game/results.js";
import { itemPrompt } from "../game/text.js";
import { getLocation, locationSummaryMessage } from "./presenters.js";

export function handleItemEncounter(player, command, event) {
  const location = getLocation(player);

  if (command === COMMANDS.TAKE) {
    if (event.item.attack) {
      player.weapon = event.item;
    } else if (event.item.hp) {
      player.armor = event.item;
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
