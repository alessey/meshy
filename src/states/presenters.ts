import worldMap from "../world/map.js";
import { EVENT_ACTIONS, getCommandLabels, getDisplayActions } from "../game/commands.js";
import { gameMessage } from "../game/results.js";
import { itemPrompt, monsterPrompt, potionPrompt, TEXT } from "../game/text.js";
import type { Player } from "../game/player.js";
import type { Location, Encounter } from "../types.js";
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
