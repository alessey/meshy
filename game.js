import worldMap from "./map.js";
import { save } from "./data.js";
import { EVENT_ACTIONS, getDisplayActions, isMovementCommand } from "./src/game/commands.js";
import { resolveLocationEvent } from "./src/game/encounters.js";
import { Player, MAX_HP } from "./src/game/player.js";
import { randomFrom } from "./src/game/random.js";
import { rollCombatDamage } from "./src/game/combat.js";
import { formatInventory } from "./src/game/inventory.js";
import { formatResponse, sendGameText } from "./src/game/messaging.js";

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

  getLocation(player) {
    return worldMap[player.location];
  }

  getDisplayActions(actions) {
    return getDisplayActions(actions);
  }

  async resolveSaveAndDisplay(senderId, player, location) {
    player.encounter = null;
    save(this.playerStates);
    return this.sendLocationSummary(senderId, player, location);
  }

  async handleGameLogic(senderId, input) {
    const command = input.toString().toLowerCase().trim();
    const player = this.getPlayer(senderId);
    const location = this.getLocation(player);

    if (player.encounter) {
      return this.handleEventInput(senderId, player, command, location);
    }

    if (!command) {
      return this.sendLocationSummary(senderId, player, location);
    }

    if (this.isMovementCommand(command)) {
      return this.handleMovement(senderId, player, command);
    }

    if (command === "i") {
      return this.handleStatusEvent(senderId, player, command, null);
    }

    return this.sendUnknownCommand(senderId, player, location);
  }

  isMovementCommand(command) {
    return isMovementCommand(command);
  }

  async handleMovement(senderId, player, command) {
    const location = this.getLocation(player);
    const nextLoc = location.actions[command];
    if (!nextLoc) {
      return this.sendUnknownCommand(senderId, player, location);
    }

    player.location = nextLoc;
    player.encounter = null;
    save(this.playerStates);
    return this.enterLocation(senderId, player);
  }

  async enterLocation(senderId, player) {
    const location = this.getLocation(player);
    const event = this.resolveLocationEvent(location);
    if (event) {
      player.encounter = event;
      return this.sendEventPrompt(senderId, player);
    }

    return this.sendLocationSummary(senderId, player, location);
  }

  resolveLocationEvent(location) {
    return resolveLocationEvent(location);
  }

  async handleEventInput(senderId, player, command, location) {
    const event = player.encounter;
    const handler = EVENT_HANDLERS[event.type];
    if (handler) {
      return handler.call(this, senderId, player, command, event, location);
    }
    return this.sendUnknownCommand(senderId, player, location);
  }

  async handleItemEvent(senderId, player, command, event) {
    const location = this.getLocation(player);

    if (command === "t") {
      if (event.item.attack) {
        player.weapon = event.item;
      } else if (event.item.hp) {
        player.armor = event.item;
      }
      return this.resolveSaveAndDisplay(senderId, player, location);
    }

    if (command === "d") {
      return this.resolveSaveAndDisplay(senderId, player, location);
    }

    const stat = event.item.attack ? `${event.item.attack} ATK` : `${event.item.hp} HP`;
    return this.sendGameText(senderId, player, `Found ${event.item.name} (${stat}). (T)ake or (D)iscard?`, EVENT_ACTIONS.item);
  }

  async handleMonsterEvent(senderId, player, command, event, location) {
    if (command === "f") {
      return this.resolveCombatRound(senderId, player, event);
    }

    if (command === "r") {
      const retreat = this.findRetreatLocation(location);
      if (retreat) {
        player.location = retreat;
        return this.resolveSaveAndDisplay(senderId, player, this.getLocation(player));
      }
      return this.resolveSaveAndDisplay(senderId, player, location);
    }

    return this.sendGameText(senderId, player, `A ${event.monster.name} appears! (F)ight or (R)un?`, EVENT_ACTIONS.monster);
  }

  async resolveCombatRound(senderId, player, event) {
    const monster = event.monster;
    const monsterDamage = rollCombatDamage(monster.attack);
    const playerDamage = rollCombatDamage(player.weapon.attack);

    monster.hp -= playerDamage;
    player.hp -= monsterDamage;

    let combatMsg = `You hit ${monster.name} for ${playerDamage}. ${monster.name} hits you for ${monsterDamage}. `;

    if (player.hp <= 0) {
      const newPlayer = new Player();
      const respawnLocation = this.getLocation(newPlayer);
      await this.sendGameText(senderId, player, `${combatMsg}You died! Respawning in the ${newPlayer.location}...`, this.getDisplayActions(respawnLocation.actions));
      Object.assign(player, newPlayer);
      save(this.playerStates);
      return;
    }

    if (monster.hp <= 0) {
      const location = this.getLocation(player);
      player.encounter = null;
      save(this.playerStates);
      return this.sendGameText(
        senderId,
        player,
        `${combatMsg}${monster.name} is defeated! ${location.desc}`,
        this.getDisplayActions(location.actions)
      );
    }

    save(this.playerStates);
    return this.sendGameText(senderId, player, `${combatMsg}Your HP: ${player.hp}. Monster HP: ${monster.hp}. (F)ight or (R)un?`, EVENT_ACTIONS.monster);
  }

  findRetreatLocation(location) {
    const exits = Object.values(location.actions);
    return randomFrom(exits);
  }

  async handlePotionEvent(senderId, player, command, event) {
    const location = this.getLocation(player);

    if (command === "u") {
      player.hp = Math.min(player.hp + event.potion.heal, MAX_HP);
      return this.resolveSaveAndDisplay(senderId, player, location);
    }

    if (command === "d") {
      return this.resolveSaveAndDisplay(senderId, player, location);
    }

    return this.sendGameText(senderId, player, `You found a ${event.potion.name}. (U)se or (D)iscard?`, EVENT_ACTIONS.potion);
  }

  async handleStatusEvent(senderId, player, command, event) {
    if (command === "i") {
      const inventory = formatInventory(player.inventory);
      return this.sendGameText(senderId, player, `Inventory:\n${inventory}`, this.getDisplayActions(this.getLocation(player).actions));
    }

    return this.sendUnknownCommand(senderId, player, this.getLocation(player));
  }

  async sendLocationSummary(senderId, player, location) {
    const message = `${location.desc}`;
    const actions = this.getDisplayActions(location.actions);
    await this.sendGameText(senderId, player, message, actions);
  }

  async sendEventPrompt(senderId, player) {
    const event = player.encounter;
    const actions = EVENT_ACTIONS[event.type];
    if (event.type === "item") {
      const stat = event.item.attack ? `${event.item.attack} ATK` : `${event.item.hp} HP`;
      return this.sendGameText(senderId, player, `Found ${event.item.name} (${stat}). (T)ake or (D)iscard?`, actions);
    }
    if (event.type === "monster") {
      return this.sendGameText(senderId, player, `A ${event.monster.name} appears! (F)ight or (R)un?`, actions);
    }
    if (event.type === "potion") {
      return this.sendGameText(senderId, player, `You found a ${event.potion.name}. (U)se or (D)iscard?`, actions);
    }
    return this.sendGameText(senderId, player, "An event is waiting.", Object.keys(worldMap[player.location].actions));
  }

  async sendUnknownCommand(senderId, player, location) {
    let actions = this.getDisplayActions(location.actions);
    if (player.encounter) {
      actions = EVENT_ACTIONS[player.encounter.type];
    }
    await this.sendGameText(senderId, player, `Unknown command.`, actions);
  }

  formatResponse(player, text, actions = []) {
    return formatResponse(player, text, actions);
  }

  async sendGameText(recipientId, player, text, actions = []) {
    return sendGameText(this.device, recipientId, player, text, actions);
  }
}

const EVENT_HANDLERS = {
  item: Game.prototype.handleItemEvent,
  monster: Game.prototype.handleMonsterEvent,
  potion: Game.prototype.handlePotionEvent,
  status: Game.prototype.handleStatusEvent,
};
