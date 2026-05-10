import { getLevel, getLevelMultiplier } from "./levels.js";
import type { Encounter, Armor, Weapon, Item, Equipment } from "../types.js";

export const MAX_HP = 20;

export class Player {
  location: string;
  _hp: number;
  weapon: Weapon;
  armor: Armor;
  items: Item[];
  xp: number;
  encounter: Encounter | null;

  constructor() {
    this.location = "";
    this._hp = MAX_HP;
    this.weapon = { name: "Fists", attack: 2 };
    this.armor = { name: "Cloth", hp: 0 };
    this.items = [];
    this.xp = 0;
    this.encounter = null;
  }

  get level() {
    return getLevel(this).level;
  }

  get hp() {
    return Math.ceil((this._hp + this.armor.hp) * getLevelMultiplier(this));
  }

  set hp(value) {
    const baseHpWithArmor = Math.ceil(value / getLevelMultiplier(this));
    this._hp = Math.min(Math.max(baseHpWithArmor - this.armor.hp, 0), MAX_HP);
  }

  get maxHp() {
    return Math.ceil((MAX_HP + this.armor.hp) * getLevelMultiplier(this));
  }

  get attack() {
    return Math.ceil(this.weapon.attack * getLevelMultiplier(this));
  }

  get inventory(): Equipment[] {
    return [this.weapon, this.armor, ...this.items];
  }

  healToFull() {
    this._hp = MAX_HP;
  }

  hasWeapon(weaponName: string): boolean {
    return this.weapon.name.toLowerCase() === weaponName.toLowerCase();
  }

  hasItem(itemName: string): boolean {
    return this.items.some((item) => item.name.toLowerCase() === itemName.toLowerCase());
  }
}

export function hydratePlayer(savedPlayer: Partial<Player> = {}) {
  const player = new Player();

  player.location = savedPlayer.location ?? player.location;
  player._hp = savedPlayer._hp ?? player._hp;
  player.weapon = savedPlayer.weapon ?? player.weapon;
  player.armor = savedPlayer.armor ?? player.armor;
  player.xp = savedPlayer.xp ?? player.xp;
  player.encounter = savedPlayer.encounter ?? player.encounter;
  player.items = savedPlayer.items ?? player.items;

  return player;
}
