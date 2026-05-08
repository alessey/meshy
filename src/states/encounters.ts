import { result } from "../game/results.js";
import { unknownCommandMessage } from "./presenters.js";
import { handleItemEncounter } from "./itemEncounter.js";
import { handleMonsterEncounter } from "./monsterEncounter.js";
import { handlePotionEncounter } from "./potionEncounter.js";
import type { Player } from "../game/player.js";
import type { GameOutcome } from "../types.js";

const ENCOUNTER_HANDLERS: Record<
  string,
  (player: Player, command: string, event: any) => GameOutcome
> = {
  item: handleItemEncounter,
  monster: handleMonsterEncounter,
  potion: handlePotionEncounter,
};

export function handleEncounter(player: Player, command: string): GameOutcome {
  const event = player.encounter;
  const handler = ENCOUNTER_HANDLERS[event?.type ?? ""];

  if (!handler) {
    return result([unknownCommandMessage(player)]);
  }

  return handler(player, command, event);
}
