import { helpMessage, inventoryMessage, playMessage, unknownCommandMessage } from "./presenters.js";
import type { Player } from "../game/player.js";
import type { Command, Message } from "../types.js";
import { COMMANDS } from "../game/commands.js";

export function handleSystem(player: Player, command: Command): Message {
  switch (command) {
    case COMMANDS.PLAY:
      return playMessage(player);
    case COMMANDS.HELP:
      return helpMessage();
    case COMMANDS.INVENTORY:
      return inventoryMessage(player);
    default:
      return unknownCommandMessage(player);
  }
}
