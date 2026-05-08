import { save } from "../storage/playerStore.js";
import { dispatchMessages } from "./messageDispatcher.js";
import { Player } from "../game/player.js";
import { handleEncounter } from "../states/encounters.js";
import { handleExploring } from "../states/exploring.js";
import { isCommand } from "../game/commands.js";
import { unknownCommandMessage } from "../states/presenters.js";
import { result } from "../game/results.js";
import worldMap from "../world/map.js";

type MeshDevice = {
  sendText(text: string, recipientId: unknown): Promise<number>;
};

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
      Object.entries(worldMap).some(([key, location]) => {
        if (location.isStart) {
          player.location = key;
          return true;
        }
      });
    }

    return player;
  }

  async handleGameLogic(senderId: string | number, input: string | number | any): Promise<void> {
    const command = input.toString().toLowerCase().trim();
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

    return dispatchMessages(this.device, senderId, player, outcome.messages);
  }
}
