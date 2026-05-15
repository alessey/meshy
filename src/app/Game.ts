import { COMMANDS, isCommand, isSystemCommand } from "../game/commands.js";
import { type Destination } from "../network/types.js";
import { Player } from "../game/player.js";
import { getStartLocationKey } from "../world/utils.js";
import { handleEncounter } from "../states/encounters.js";
import { handleExploring } from "../states/exploring.js";
import { unknownCommandMessage } from "../states/presenters.js";
import { result } from "../game/results.js";
import { save } from "../storage/playerStore.js";
import worldMap from "../world/map.js";
import type { GameOutcome, Message } from "../types.js";
import { formatMessage } from "../utils/messageFormatter.js";
import { handleSystem } from "../states/system.js";

const GAME_PREFIX = "/";

export class Game {
  playerStates: Map<string, Player>;

  constructor(playerStates: Map<string, Player>) {
    this.playerStates = playerStates;
  }

  getPlayer(senderId: string | number): Player {
    const idString = senderId.toString();
    let player = this.playerStates.get(idString);

    if (!player) {
      player = new Player();
      this.playerStates.set(idString, player);
    }

    // ensure saved location matches current world map
    if (!worldMap[player.location]) {
      player.location = getStartLocationKey();
    }

    return player;
  }

  handleGameLogic(senderId: Destination, input: string | number | Uint8Array): Message[] {
    const rawInput = input.toString().trim();

    if (!rawInput) {
      return [];
    }

    if (!rawInput.startsWith(GAME_PREFIX)) {
      return [
        {
          type: "plain",
          text: "Commands should start with a slash (e.g. /play). Type /help for more info.",
        },
      ];
    }

    const command = rawInput.slice(GAME_PREFIX.length).toLowerCase().trim() || COMMANDS.PLAY;
    const player = this.getPlayer(senderId);

    let outcome: GameOutcome = { messages: [], shouldSave: false };
    if (isCommand(command)) {
      if (isSystemCommand(command)) {
        const systemMessage = handleSystem(player, command);
        if (systemMessage) {
          outcome.messages.push(systemMessage);
        }
      }

      const result = player.encounter
        ? handleEncounter(player, command)
        : handleExploring(player, command);

      outcome = {
        messages: outcome.messages.concat(result.messages),
        shouldSave: result.shouldSave,
      };
    } else {
      outcome = result([unknownCommandMessage(player)]);
    }

    if (outcome.shouldSave) {
      save(this.playerStates);
    }

    return outcome.messages.map((msg) => formatMessage(player, msg));
  }
}
