import { COMMANDS, EVENT_ACTIONS, getCommandLabels } from "../game/commands.js";
import { gameMessage, result } from "../game/results.js";
import { itemPrompt } from "../game/text.js";
import { getLocation, locationSummaryMessage } from "./presenters.js";
import type { Player } from "../game/player.js";
import type { ItemEncounter, GameOutcome, ItemCommand, PotionCommand } from "../types.js";

export function handleItemEncounter(
  player: Player,
  command: ItemCommand | PotionCommand,
  event: ItemEncounter,
): GameOutcome {
  const location = getLocation(player);

  if (command === COMMANDS.TAKE || command === COMMANDS.USE) {
    switch (event.item.type) {
      case "potion":
        player.hp += event.item.heal;
        break;
      case "weapon":
        player.weapon = event.item;
        break;
      case "armor":
        player.armor = event.item;
        break;
      case "item":
        player.items.push(event.item);
        break;
    }

    player.encounter = null;
    return result([locationSummaryMessage(location)], { shouldSave: true });
  }

  if (command === COMMANDS.DISCARD) {
    player.encounter = null;
    return result([locationSummaryMessage(location)], { shouldSave: true });
  }

  const actions = event.item.type === "potion" ? EVENT_ACTIONS.potion : EVENT_ACTIONS.item;

  return result([gameMessage(itemPrompt(event.item), getCommandLabels(actions))]);
}
