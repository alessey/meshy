import { result } from "../game/results.js";
import { unknownCommandMessage } from "./presenters.js";
import { handleItemEncounter } from "./itemEncounter.js";
import { handleMonsterEncounter } from "./monsterEncounter.js";
import { handlePotionEncounter } from "./potionEncounter.js";

const ENCOUNTER_HANDLERS = {
  item: handleItemEncounter,
  monster: handleMonsterEncounter,
  potion: handlePotionEncounter,
};

export function handleEncounter(player, command) {
  const event = player.encounter;
  const handler = ENCOUNTER_HANDLERS[event.type];

  if (!handler) {
    return result([unknownCommandMessage(player)]);
  }

  return handler(player, command, event);
}
