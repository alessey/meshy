/**
 * Equipment and Inventory Types
 */
export interface Equipment {
  name: string;
  attack?: number;
  hp?: number;
}

export interface Weapon extends Equipment {
  attack: number;
}

export interface Armor extends Equipment {
  hp: number;
}

/**
 * Encounter Types
 */
export interface BaseEncounter {
  type: string;
}

export interface ItemEncounter extends BaseEncounter {
  type: "item";
  item: Equipment;
}

export interface Monster {
  name: string;
  hp: number;
  attack: number;
  xp?: number;
}

export interface MonsterEncounter extends BaseEncounter {
  type: "monster";
  monster: Monster;
}

export interface Potion {
  name: string;
  heal: number;
}

export interface PotionEncounter extends BaseEncounter {
  type: "potion";
  potion: Potion;
}

export type Encounter = ItemEncounter | MonsterEncounter | PotionEncounter;

/**
 * Location Types
 */
export interface LocationActions {
  [direction: string]: string;
}

export interface Location {
  desc: string;
  actions: LocationActions;
  itemChance?: number;
  itemPool?: Equipment[];
  monsterChance?: number;
  monsterPool?: Monster[];
  potionChance?: number;
  potionHeal?: number;
}

/**
 * Message Types
 */
export interface GameMessage {
  type: "game";
  text: string;
  actions: string[];
}

export interface PlainMessage {
  type: "plain";
  text: string;
}

export type Message = GameMessage | PlainMessage;

/**
 * Result/Outcome Types
 */
export interface GameOutcome {
  messages: Message[];
  shouldSave: boolean;
}

/**
 * Reward Types  
 */
export interface MonsterReward {
  xp: number;
  didLevelUp: boolean;
  level: number;
}

/**
 * Player-related Types
 */
export interface PlainPlayer {
  location: string;
  _hp: number;
  weapon: Equipment;
  armor: Equipment;
  xp: number;
  encounter: Encounter | null;
}

/**
 * Player Store Types
 */
export type PlayerStateMap = Map<string, PlainPlayer>;

