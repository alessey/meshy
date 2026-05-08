import { MAX_HP } from "../game/player.js";
import { COMMANDS, EVENT_ACTIONS, getCommandLabels } from "../game/commands.js";
import { gameMessage, result } from "../game/results.js";
import { potionPrompt } from "../game/text.js";
import { getLocation, locationSummaryMessage } from "./presenters.js";
import type { Player } from "../game/player.js";
import type { PotionEncounter, GameOutcome } from "../types.js";

export function handlePotionEncounter(player: Player, command: string, event: PotionEncounter): GameOutcome {
  const location = getLocation(player);

  if (command === COMMANDS.USE) {
    player.hp = Math.min(player.hp + event.potion.heal, MAX_HP);
    player.encounter = null;
    return result([locationSummaryMessage(location)], { shouldSave: true });
  }

  if (command === COMMANDS.DISCARD) {
    player.encounter = null;
    return result([locationSummaryMessage(location)], { shouldSave: true });
  }

  return result([gameMessage(potionPrompt(event.potion), getCommandLabels(EVENT_ACTIONS.potion))]);
}
