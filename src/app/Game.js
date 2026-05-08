import { save } from "../storage/playerStore.js";
import { dispatchMessages } from "./messageDispatcher.js";
import { Player } from "../game/player.js";
import { handleEncounter } from "../states/encounters.js";
import { handleExploring } from "../states/exploring.js";

export class Game {
  constructor(device, playerStates) {
    this.device = device;
    this.playerStates = playerStates;
  }

  getPlayer(senderId) {
    const idString = senderId.toString();
    let player = this.playerStates.get(idString);

    if (!player) {
      player = new Player();
      this.playerStates.set(idString, player);
    }

    return player;
  }

  async handleGameLogic(senderId, input) {
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
