import { COMMANDS, EVENT_ACTIONS, getCommandLabels } from "../game/commands.js";
import { gameMessage, result } from "../game/results.js";
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

  const stat = event.item.attack ? `${event.item.attack} ATK` : `${event.item.hp} HP`;
  return result([gameMessage(`Found ${event.item.name} (${stat}). (T)ake or (D)iscard?`, getCommandLabels(EVENT_ACTIONS.item))]);
}
