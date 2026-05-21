import { getLevel, getLevelMultiplier } from "./levels.js";
import type { Encounter, Armor, Weapon, Item, Equipment } from "../types.js";

export const MAX_HP = 20;

export class Player {
  id: string;
  location: string;
  _hp: number;
  private _armor: Armor;
  weapon: Weapon;
  items: Item[];
  xp: number;
  encounter: Encounter | null;

  constructor(id: string) {
    this.id = id;
    this.location = "";
    this.weapon = { name: "Fists", attack: 2 };
    this._armor = { name: "Cloth", hp: 2 };
    this._hp = MAX_HP;
    this.items = [];
    this.xp = 0;
    this.encounter = null;
  }

  get level() {
    return getLevel(this).level;
  }

  get armor(): Armor {
    return this._armor;
  }

  set armor(newArmor: Armor) {
    this._armor = {
      ...newArmor,
      max: newArmor.max ?? newArmor.hp,
    };
  }

  get hp() {
    return Math.ceil((this._hp + this.armor.hp) * getLevelMultiplier(this));
  }

  set hp(value) {
    const multiplier = getLevelMultiplier(this);
    const unscaledNewTotal = Math.ceil(value / multiplier);
    const currentUnscaledTotal = this._hp + this.armor.hp;
    const diff = unscaledNewTotal - currentUnscaledTotal;

    if (diff < 0) {
      let damageRemaining = Math.abs(diff);

      const armorDamage = Math.min(this.armor.hp, damageRemaining);
      this.armor.hp -= armorDamage;
      damageRemaining -= armorDamage;

      this._hp = Math.max(0, this._hp - damageRemaining);
    } else if (diff > 0) {
      // healing doesn't fix armor
      this._hp = Math.min(MAX_HP, this._hp + diff);
    }
  }

  get maxHp() {
    return Math.ceil((MAX_HP + this._armor.hp) * getLevelMultiplier(this));
  }

  get attack() {
    return Math.ceil(this.weapon.attack * getLevelMultiplier(this));
  }

  get inventory(): Equipment[] {
    return [this.weapon, this._armor, ...this.items];
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

export function hydratePlayer(id: string, savedPlayer: Partial<Player> = {}) {
  const player = new Player(id);

  player.location = savedPlayer.location ?? player.location;
  player.armor = savedPlayer.armor ?? player.armor;
  player._hp = savedPlayer._hp ?? player._hp;
  player.weapon = savedPlayer.weapon ?? player.weapon;
  player.xp = savedPlayer.xp ?? player.xp;
  player.encounter = savedPlayer.encounter ?? player.encounter;
  player.items = savedPlayer.items ?? player.items;

  return player;
}
