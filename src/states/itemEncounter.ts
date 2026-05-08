import { COMMANDS, EVENT_ACTIONS, getCommandLabels } from "../game/commands.js";
import { gameMessage, result } from "../game/results.js";
import { itemPrompt } from "../game/text.js";
import { getLocation, locationSummaryMessage } from "./presenters.js";
import type { Player } from "../game/player.js";
import type { ItemEncounter, GameOutcome } from "../types.js";

export function handleItemEncounter(player: Player, command: string, event: ItemEncounter): GameOutcome {
  const location = getLocation(player);

  if (command === COMMANDS.TAKE) {
    if (event.item.attack !== undefined) {
      player.weapon = event.item as any;
    } else if (event.item.hp !== undefined) {
      player.armor = event.item as any;
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
