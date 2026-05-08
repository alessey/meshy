import worldMap from "../world/map.js";
import { EVENT_ACTIONS, getCommandLabels, getDisplayActions } from "../game/commands.js";
import { gameMessage } from "../game/results.js";
import { itemPrompt, monsterPrompt, potionPrompt, TEXT } from "../game/text.js";
export function getLocation(player) {
    return worldMap[player.location];
}
export function locationSummaryMessage(location) {
    return gameMessage(location.desc, getDisplayActions(location.actions));
}
export function eventPromptMessage(event, player) {
    const actions = getCommandLabels(EVENT_ACTIONS[event.type]);
    if (event.type === "item") {
        return gameMessage(itemPrompt(event.item), actions);
    }
    if (event.type === "monster") {
        return gameMessage(monsterPrompt(event.monster), actions);
    }
    if (event.type === "potion") {
        return gameMessage(potionPrompt(event.potion), actions);
    }
    return gameMessage(TEXT.WAITING_EVENT, getDisplayActions(getLocation(player).actions));
}
export function unknownCommandMessage(player) {
    const location = getLocation(player);
    const actions = player.encounter
        ? getCommandLabels(EVENT_ACTIONS[player.encounter.type])
        : getDisplayActions(location.actions);
    return gameMessage(TEXT.UNKNOWN_COMMAND, actions);
}
