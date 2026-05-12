import { COMMANDS, isCommand } from "../game/commands.js";
import { type Destination } from "../network/types.js";
import { Player } from "../game/player.js";
import { getStartLocationKey } from "../world/utils.js";
import { handleEncounter } from "../states/encounters.js";
import { handleExploring } from "../states/exploring.js";
import { unknownCommandMessage } from "../states/presenters.js";
import { result } from "../game/results.js";
import { save } from "../storage/playerStore.js";
import worldMap from "../world/map.js";
import type { Message } from "../types.js";
import { formatMessage } from "./messageFormatter.js";

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

    if (!rawInput || !rawInput.startsWith(GAME_PREFIX)) {
      return [];
    }

    const command = rawInput.slice(GAME_PREFIX.length).toLowerCase().trim() || COMMANDS.PLAY;
    const player = this.getPlayer(senderId);

    let outcome;
    if (isCommand(command)) {
      outcome = player.encounter
        ? handleEncounter(player, command)
        : handleExploring(player, command);
    } else {
      outcome = result([unknownCommandMessage(player)]);
    }

    if (outcome.shouldSave) {
      save(this.playerStates);
    }

    return outcome.messages.map((msg) => formatMessage(player, msg));
  }
}
