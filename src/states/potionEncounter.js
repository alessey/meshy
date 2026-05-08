import { MAX_HP } from "../game/player.js";
import { EVENT_ACTIONS } from "../game/commands.js";
import { gameMessage, result } from "../game/results.js";
import { getLocation, locationSummaryMessage } from "./presenters.js";

export function handlePotionEncounter(player, command, event) {
  const location = getLocation(player);

  if (command === "u") {
    player.hp = Math.min(player.hp + event.potion.heal, MAX_HP);
    player.encounter = null;
    return result([locationSummaryMessage(location)], { shouldSave: true });
  }

  if (command === "d") {
    player.encounter = null;
    return result([locationSummaryMessage(location)], { shouldSave: true });
  }

  return result([gameMessage(`You found a ${event.potion.name}. (U)se or (D)iscard?`, EVENT_ACTIONS.potion)]);
}
