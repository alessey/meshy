import { save } from "../storage/playerStore.js";
import { dispatchMessages } from "./messageDispatcher.js";
import { Player } from "../game/player.js";
import { handleEncounter } from "../states/encounters.js";
import { handleExploring } from "../states/exploring.js";
import { COMMANDS, isCommand } from "../game/commands.js";
import { unknownCommandMessage } from "../states/presenters.js";
import { result } from "../game/results.js";
import { getStartLocationKey } from "../world/utils.js";
import worldMap from "../world/map.js";

type MeshDevice = {
  sendText(text: string, recipientId: unknown): Promise<number>;
};

const GAME_PREFIX = "/";

export class Game {
  device: MeshDevice;
  playerStates: Map<string, Player>;

  constructor(device: MeshDevice, playerStates: Map<string, Player>) {
    this.device = device;
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

  async handleGameLogic(
    senderId: string | number,
    input: string | number | Uint8Array,
  ): Promise<void> {
    const rawInput = input.toString().trim();
    console.log("raw input", rawInput);
    if (!rawInput || !rawInput.startsWith(GAME_PREFIX)) {
      return;
    }
    console.log("2");
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
    console.log("3", outcome.messages);
    // Always respond directly to the sender to keep the game private and save airtime
    return dispatchMessages(this.device, senderId, player, outcome.messages);
  }
}
