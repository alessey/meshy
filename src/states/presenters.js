import worldMap from "../world/map.js";
import { EVENT_ACTIONS, getDisplayActions } from "../game/commands.js";
import { gameMessage } from "../game/results.js";

export function getLocation(player) {
  return worldMap[player.location];
}

export function locationSummaryMessage(location) {
  return gameMessage(location.desc, getDisplayActions(location.actions));
}

export function eventPromptMessage(event, player) {
  const actions = EVENT_ACTIONS[event.type];

  if (event.type === "item") {
    const stat = event.item.attack ? `${event.item.attack} ATK` : `${event.item.hp} HP`;
    return gameMessage(`Found ${event.item.name} (${stat}). (T)ake or (D)iscard?`, actions);
  }

  if (event.type === "monster") {
    return gameMessage(`A ${event.monster.name} appears! (F)ight or (R)un?`, actions);
  }

  if (event.type === "potion") {
    return gameMessage(`You found a ${event.potion.name}. (U)se or (D)iscard?`, actions);
  }

  return gameMessage("An event is waiting.", getDisplayActions(getLocation(player).actions));
}

export function unknownCommandMessage(player) {
  const location = getLocation(player);
  const actions = player.encounter
    ? EVENT_ACTIONS[player.encounter.type]
    : getDisplayActions(location.actions);

  return gameMessage("Unknown command.", actions);
}
