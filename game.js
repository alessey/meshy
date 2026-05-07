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
  inventory: [],
  encounter: null,
};

const MOVEMENT_COMMANDS = ["n", "s", "e", "w"];
const EVENT_ACTIONS = {
  item: ["T", "D"],
  monster: ["F", "R"],
  potion: ["U", "D"],
};

function roll(chance = 1) {
  return Math.random() < chance;
}

function randomFrom(array) {
  return array.length ? array[Math.floor(Math.random() * array.length)] : null;
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
      player = { ...INITIAL_PLAYER, encounter: null };
      this.playerStates.set(idString, player);
    }
    return player;
  }

  getRoom(player) {
    return worldMap[player.location];
  }

  async resolveSaveAndDisplay(senderId, player, room) {
    player.encounter = null;
    save(this.playerStates);
    return this.sendLocationSummary(senderId, player, room);
  }

  async handleGameLogic(senderId, input) {
    const command = input.toString().toLowerCase().trim();
    const player = this.getPlayer(senderId);
    const room = this.getRoom(player);

    if (player.encounter) {
      return this.handleEventInput(senderId, player, command, room);
    }

    if (!command) {
      return this.sendLocationSummary(senderId, player, room);
    }

    if (this.isMovementCommand(command)) {
      return this.handleMovement(senderId, player, command);
    }

    return this.sendUnknownCommand(senderId, player, room);
  }

  isMovementCommand(command) {
    return MOVEMENT_COMMANDS.includes(command);
  }

  async handleMovement(senderId, player, command) {
    const currentRoom = this.getRoom(player);
    const nextLoc = currentRoom.actions[command];
    if (!nextLoc) {
      return this.sendUnknownCommand(senderId, player, currentRoom);
    }

    player.location = nextLoc;
    player.encounter = null;
    await save(this.playerStates);
    return this.enterLocation(senderId, player);
  }

  async enterLocation(senderId, player) {
    const room = this.getRoom(player);
    const event = this.resolveRoomEvent(room);
    if (event) {
      player.encounter = event;
      return this.sendEventPrompt(senderId, player);
    }

    return this.sendLocationSummary(senderId, player, room);
  }

  resolveRoomEvent(room) {
    const eventTypes = [
      {
        pool: room.itemPool,
        chance: room.itemChance ?? 0,
        build: () => ({ type: "item", item: { ...randomFrom(room.itemPool) } }),
      },
      {
        pool: room.monsterPool,
        chance: room.monsterChance ?? 0,
        build: () => ({ type: "monster", monster: { ...randomFrom(room.monsterPool) } }),
      },
      {
        chance: room.potionChance ?? 0,
        build: () => ({ type: "potion", potion: { name: "Health Potion", heal: room.potionHeal ?? 10 } }),
      },
    ];

    for (const { pool, chance, build } of eventTypes) {
      if (pool?.length && roll(chance)) {
        return build();
      }
    }

    return null;
  }

  async handleEventInput(senderId, player, command, room) {
    const event = player.encounter;
    const handler = EVENT_HANDLERS[event.type];
    if (handler) {
      return handler.call(this, senderId, player, command, event);
    }
    return this.sendUnknownCommand(senderId, player, room);
  }

  async handleItemEvent(senderId, player, command, event) {
    const room = this.getRoom(player);

    if (command === "t") {
      if (event.item.attack) {
        player.weapon = event.item;
      } else if (event.item.hp) {
        player.hp += event.item.hp;
      }
      return this.resolveSaveAndDisplay(senderId, player, room);
    }

    if (command === "d") {
      return this.resolveSaveAndDisplay(senderId, player, room);
    }

    const stat = event.item.attack ? `${event.item.attack} ATK` : `${event.item.hp} HP`;
    return this.sendGameText(senderId, player, `Found ${event.item.name} (${stat}). Take (T) or Discard (D)?`, EVENT_ACTIONS.item);
  }

  async handleMonsterEvent(senderId, player, command, event, room) {
    if (command === "f") {
      return this.resolveCombatRound(senderId, player, event);
    }

    if (command === "r") {
      const retreat = this.findRetreatLocation(room);
      if (retreat) {
        player.location = retreat;
        return this.resolveSaveAndDisplay(senderId, player, this.getRoom(player));
      }
      return this.resolveSaveAndDisplay(senderId, player, room);
    }

    return this.sendGameText(senderId, player, `A ${event.monster.name} appears! Fight (F) or Run (R)?`, EVENT_ACTIONS.monster);
  }

  async resolveCombatRound(senderId, player, event) {
    const monster = event.monster;
    monster.hp -= player.weapon.attack;
    player.hp -= monster.attack;

    let combatMsg = `You hit ${monster.name} for ${player.weapon.attack}. ${monster.name} hits you for ${monster.attack}. `;

    if (player.hp <= 0) {
      player.location = INITIAL_PLAYER.location;
      player.hp = MAX_HP;
      player.weapon = { ...INITIAL_PLAYER.weapon };
      player.encounter = null;
      await save(this.playerStates);
      const respawnRoom = this.getRoom(player);
      return this.sendGameText(senderId, player, `${combatMsg}You died! Respawning in the woods...`, Object.keys(respawnRoom.actions));
    }

    if (monster.hp <= 0) {
      const room = this.getRoom(player);
      player.encounter = null;
      await save(this.playerStates);
      return this.sendGameText(
        senderId,
        player,
        `${combatMsg}${monster.name} is defeated! ${room.desc}`,
        Object.keys(room.actions)
      );
    }

    await save(this.playerStates);
    return this.sendGameText(senderId, player, `${combatMsg}Your HP: ${player.hp}. Monster HP: ${monster.hp}. Fight (F) or Run (R)?`, EVENT_ACTIONS.monster);
  }

  findRetreatLocation(room) {
    const exits = Object.values(room.actions);
    return randomFrom(exits);
  }

  async handlePotionEvent(senderId, player, command, event) {
    const room = this.getRoom(player);

    if (command === "u") {
      player.hp = Math.min(player.hp + event.potion.heal, MAX_HP);
      return this.resolveSaveAndDisplay(senderId, player, room);
    }

    if (command === "d") {
      return this.resolveSaveAndDisplay(senderId, player, room);
    }

    return this.sendGameText(senderId, player, `You found a ${event.potion.name}. Use (U) or Discard (D)?`, EVENT_ACTIONS.potion);
  }

  async sendLocationSummary(senderId, player, room) {
    const message = `${room.desc}`;
    const actions = Object.keys(room.actions);
    await this.sendGameText(senderId, player, message, actions);
  }

  async sendEventPrompt(senderId, player) {
    const event = player.encounter;
    const actions = EVENT_ACTIONS[event.type];
    if (event.type === "item") {
      const stat = event.item.attack ? `${event.item.attack} ATK` : `${event.item.hp} HP`;
      return this.sendGameText(senderId, player, `Found ${event.item.name} (${stat}). Take (T) or Discard (D)?`, actions);
    }
    if (event.type === "monster") {
      return this.sendGameText(senderId, player, `A ${event.monster.name} appears! Fight (F) or Run (R)?`, actions);
    }
    if (event.type === "potion") {
      return this.sendGameText(senderId, player, `You found a ${event.potion.name}. Use (U) or Discard (D)?`, actions);
    }
    return this.sendGameText(senderId, player, "An event is waiting.", Object.keys(worldMap[player.location].actions));
  }

  async sendUnknownCommand(senderId, player, room) {
    let actions = Object.keys(room.actions);
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
};
