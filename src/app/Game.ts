import { save } from "../storage/playerStore.js";
import { dispatchMessages } from "./messageDispatcher.js";
import { Player } from "../game/player.js";
import { handleEncounter } from "../states/encounters.js";
import { handleExploring } from "../states/exploring.js";

interface MeshDevice {
  sendText(text: string, recipientId: unknown): Promise<number>;
}

export class Game {
  device: MeshDevice;
  playerStates: Map<string, Player>;

  constructor(device: MeshDevice, playerStates: Map<string, Player>) {
    this.device = device;
    this.playerStates = playerStates;
  }

  getPlayer(senderId: unknown): Player {
    const idString = senderId.toString();
    let player = this.playerStates.get(idString);

    if (!player) {
      player = new Player();
      this.playerStates.set(idString, player);
    }

    return player;
  }

  async handleGameLogic(senderId: unknown, input: string | number | any): Promise<void> {
    const command = input.toString().toLowerCase().trim();
    const player = this.getPlayer(senderId);
    const outcome = player.encounter
      ? handleEncounter(player, command)
      : handleExploring(player, command);

    if (outcome.shouldSave) {
      save(this.playerStates);
    }

    return dispatchMessages(this.device, senderId, player, outcome.messages);
  }
}
