import { CHAR_LIMIT, USE_MOCK } from "./constants.js";
import worldMap from "./map.js";
import { save } from "./data.js";
import { logError } from "./logging.js";

const MAX_HP = 20;
const INITIAL_PLAYER = {
  location: "woods",
  hp: MAX_HP,
  weapon: { name: "Fists", attack: 2 },
  armor: { name: "Cloth", hp: 0 },
  encounter: null,
};

const MOVEMENT_COMMANDS = ["M", "S", "E", "W"];
const EVENT_ACTIONS = {
  item: ["T", "D"],
  monster: ["F", "R"],
  potion: ["U", "D"],
  inventory: ["I"],
};

function roll(chance = 1) {
  return Math.random() < chance;
}

function randomFrom(array) {
  return array.length ? array[Math.floor(Math.random() * array.length)] : null;
}

class Player {
  constructor() {
    this.location = "woods";
    this._hp = MAX_HP;
    this.weapon = { name: "Fists", attack: 2 };
    this.armor = { name: "Cloth", hp: 0 };
    this.encounter = null;
  }

  get hp() {
    return this._hp + this.armor.hp;
  }

  set hp(value) {
    this._hp = Math.min(value, MAX_HP);
  }

  get inventory() {
    return [this.weapon, this.armor];
  }
}

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
    return MOVEMENT_COMMANDS.includes(command.toUpperCase());
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
    const eventTypes = [
      {
        pool: location.itemPool,
        chance: location.itemChance ?? 0,
        build: () => ({ type: "item", item: { ...randomFrom(location.itemPool) } }),
      },
      {
        pool: location.monsterPool,
        chance: location.monsterChance ?? 0,
        build: () => ({ type: "monster", monster: { ...randomFrom(location.monsterPool) } }),
      },
      {
        chance: location.potionChance ?? 0,
        build: () => ({ type: "potion", potion: { name: "Health Potion", heal: location.potionHeal ?? 10 } }),
      },
    ];

    for (const { pool, chance, build } of eventTypes) {
      if (pool?.length && roll(chance)) {
        return build();
      }
    }

    return null;
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
    monster.hp -= player.weapon.attack;
    player.hp -= monster.attack;

    let combatMsg = `You hit ${monster.name} for ${player.weapon.attack}. ${monster.name} hits you for ${monster.attack}. `;

    if (player.hp <= 0) {
      player = new Player();
      save(this.playerStates);
      const respawnLocation = this.getLocation(player);
      return this.sendGameText(senderId, player, `${combatMsg}You died! Respawning in the woods...`, Object.keys(respawnLocation.actions));
    }

    if (monster.hp <= 0) {
      const location = this.getLocation(player);
      player.encounter = null;
      save(this.playerStates);
      return this.sendGameText(
        senderId,
        player,
        `${combatMsg}${monster.name} is defeated! ${location.desc}`,
        Object.keys(location.actions)
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
      const inventory = player.getInventory();
      return this.sendGameText(senderId, player, `Inventory:\n${inventory}`, Object.keys(this.getLocation(player).actions));
    }

    return this.sendUnknownCommand(senderId, player, this.getLocation(player));
  }

  async sendLocationSummary(senderId, player, location) {
    const message = `${location.desc}`;
    const actions = Object.keys(location.actions);
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
    let actions = Object.keys(location.actions);
    if (player.encounter) {
      actions = EVENT_ACTIONS[player.encounter.type];
    }
    await this.sendGameText(senderId, player, `Unknown command.`, actions);
  }

  formatResponse(player, text, actions = []) {
    const status = `[HP: ${player.hp}, ATK: ${player.weapon.attack}]`;
    const actionList = actions.length ? ` [${actions.join(", ")}]` : "";
    return `${status} ${text}${actionList}`;
  }

  async sendGameText(recipientId, player, text, actions = []) {
    const formattedText = this.formatResponse(player, text, actions);
    const safeText = formattedText.length > CHAR_LIMIT ? formattedText.substring(0, CHAR_LIMIT - 3) + "..." : formattedText;
    if (USE_MOCK) {
      process.stdout.write(`\n[OUTGOING TO ${recipientId}]: ${safeText}\n> `);
    } else {
      try {
        await this.device.sendText(safeText, recipientId);
      } catch (e) {
        logError(`Send Error:`, e);
      }
    }
  }
}

const EVENT_HANDLERS = {
  item: Game.prototype.handleItemEvent,
  monster: Game.prototype.handleMonsterEvent,
  potion: Game.prototype.handlePotionEvent,
  status: Game.prototype.handleStatusEvent,
};
