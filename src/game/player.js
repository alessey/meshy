export const MAX_HP = 20;

export class Player {
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

export function hydratePlayer(savedPlayer = {}) {
  const player = new Player();

  player.location = savedPlayer.location ?? player.location;
  player._hp = savedPlayer._hp ?? player._hp;
  player.weapon = savedPlayer.weapon ?? player.weapon;
  player.armor = savedPlayer.armor ?? player.armor;
  player.encounter = savedPlayer.encounter ?? player.encounter;

  return player;
}
