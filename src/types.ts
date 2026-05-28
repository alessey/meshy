import type { COMMANDS, EVENT_ACTIONS, SYSTEM_ACTIONS } from "./game/commands.js";

/**
 * Equipment and Inventory Types
 */
export type ItemType = "weapon" | "armor" | "potion" | "item";

export type BaseItem = {
  name: string;
  type: ItemType;
};

export type Weapon = BaseItem & {
  type: "weapon";
  attack: number;
};

export type Armor = BaseItem & {
  type: "armor";
  hp: number;
  max?: number;
};

export type Potion = BaseItem & {
  type: "potion";
  heal: number;
};

export type Item = BaseItem & {
  type: "item";
};

export type Loot = Weapon | Armor | Potion | Item;

export type BaseEncounter = {
  type: string;
};

export type ItemEncounter = BaseEncounter & {
  type: "item";
  item: Loot;
};

export type Monster = {
  name: string;
  hp: number;
  attack: number;
  xp?: number;
  lootChance?: number;
  lootPool?: Loot[];
  hasWon?: boolean;
};

export type MonsterEncounter = BaseEncounter & {
  type: "monster";
  monster: Monster;
};

export type Encounter = ItemEncounter | MonsterEncounter;

/**
 * Event Types
 */
type EventActionsConfig = typeof EVENT_ACTIONS;

export type ItemCommand = EventActionsConfig["item"][number];
export type PotionCommand = EventActionsConfig["potion"][number];
export type MonsterCommand = EventActionsConfig["monster"][number];

/**
 * System Actions Types
 */
export type SystemCommand = (typeof SYSTEM_ACTIONS)[number];

/**
 * Command Unions
 */
export type Command = Direction | ItemCommand | MonsterCommand | PotionCommand | SystemCommand;

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
  encounterChance?: number;
  encounterPool?: Encounter[];
  isStart?: boolean;
  requiredItem?: string;
  cellType?:
    | "desert"
    | "forest"
    | "grass"
    | "hills"
    | "lake"
    | "mountain-road"
    | "mountains"
    | "pyramid"
    | "river"
    | "temple"
    | "waterfall"
    | "mine"
    | "mountain-peaks"
    | "stone-bridge"
    | "doors"
    | "road"
    | "forest-camp"
    | "jungle"
    | "swamp";
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
  weapon: Weapon;
  armor: Armor;
  items: Item[];
  xp: number;
  encounter: Encounter | null;
};

/**
 * Player Store Types
 */
export type PlayerStateMap = Map<string, PlainPlayer>;
