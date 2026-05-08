import { COMMANDS, EVENT_ACTIONS, GAME_ACTIONS } from "./game/commands.js";

/**
 * Equipment and Inventory Types
 */
export type Equipment = {
  name: string;
  attack?: number;
  hp?: number;
};

export type Weapon = Equipment & {
  attack: number;
};

export type Armor = Equipment & {
  hp: number;
};

/**
 * Encounter Types
 */
export type BaseEncounter = {
  type: string;
};

export type ItemEncounter = BaseEncounter & {
  type: "item";
  item: Equipment;
};

export type Monster = {
  name: string;
  hp: number;
  attack: number;
  xp?: number;
};

export type MonsterEncounter = BaseEncounter & {
  type: "monster";
  monster: Monster;
};

export type Potion = {
  name: string;
  heal: number;
};

export type PotionEncounter = BaseEncounter & {
  type: "potion";
  potion: Potion;
};

export type Encounter = ItemEncounter | MonsterEncounter | PotionEncounter;

/**
 * Event Types
 */
type EventActionsConfig = typeof EVENT_ACTIONS;

export type ItemCommand = EventActionsConfig["item"][number];
export type MonsterCommand = EventActionsConfig["monster"][number];
export type PotionCommand = EventActionsConfig["potion"][number];
export type InventoryCommand = EventActionsConfig["inventory"][number];

/**
 * Game Actions Types
 */
export type PlayCommand = (typeof GAME_ACTIONS)[number];

/**
 * Command Unions
 */
export type Command =
  | Direction
  | ItemCommand
  | MonsterCommand
  | PotionCommand
  | InventoryCommand
  | PlayCommand;

/**
 * Location Types
 */
export type Direction =
  | typeof COMMANDS.MOVE_NORTH
  | typeof COMMANDS.MOVE_SOUTH
  | typeof COMMANDS.MOVE_EAST
  | typeof COMMANDS.MOVE_WEST;

export type LocationActions = {
  [direction in Direction]?: string;
};

export type Location = {
  desc: string;
  actions: LocationActions;
  itemChance?: number;
  itemPool?: Equipment[];
  monsterChance?: number;
  monsterPool?: Monster[];
  potionChance?: number;
  potionHeal?: number;
  isStart?: boolean;
};

/**
 * Message Types
 */
export type GameMessage = {
  type: "game";
  text: string;
  actions: string[];
};

export type PlainMessage = {
  type: "plain";
  text: string;
};

export type Message = GameMessage | PlainMessage;

/**
 * Result/Outcome Types
 */
export type GameOutcome = {
  messages: Message[];
  shouldSave: boolean;
};

/**
 * Reward Types
 */
export type MonsterReward = {
  xp: number;
  didLevelUp: boolean;
  level: number;
};

/**
 * Player-related Types
 */
export type PlainPlayer = {
  location: string;
  _hp: number;
  weapon: Equipment;
  armor: Equipment;
  xp: number;
  encounter: Encounter | null;
};

/**
 * Player Store Types
 */
export type PlayerStateMap = Map<string, PlainPlayer>;
