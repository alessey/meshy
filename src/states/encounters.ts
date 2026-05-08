import { result } from "../game/results.js";
import { eventPromptMessage, unknownCommandMessage } from "./presenters.js";
import { handleItemEncounter } from "./itemEncounter.js";
import { handleMonsterEncounter } from "./monsterEncounter.js";
import { handlePotionEncounter } from "./potionEncounter.js";
import { COMMANDS, isItemCommand, isMonsterCommand, isPotionCommand } from "../game/commands.js";
import type { Player } from "../game/player.js";
import type { Command, GameOutcome } from "../types.js";

export function handleEncounter(player: Player, command: Command): GameOutcome {
  const event = player.encounter;

  if (command === COMMANDS.PLAY && event) {
    return result([eventPromptMessage(event, player)]);
  }

  switch (event?.type) {
    case "item":
      if (isItemCommand(command)) {
        return handleItemEncounter(player, command, event);
      }
      break;
    case "monster":
      if (isMonsterCommand(command)) {
        return handleMonsterEncounter(player, command, event);
      }
      break;
    case "potion":
      if (isPotionCommand(command)) {
        return handlePotionEncounter(player, command, event);
      }
      break;
    default:
      // Unhandled encounter type
      return result([unknownCommandMessage(player)]);
  }

  // If the command doesn't match the encounter type or the type is unhandled
  return result([unknownCommandMessage(player)]);
}
