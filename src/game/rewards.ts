import { randomFrom, roll } from "./random.js";
import type { Monster, MonsterReward, Loot } from "../types.js";
import { type Player } from "./player.js";

export function grantMonsterXp(player: Player, monster: Monster): MonsterReward {
  const previousLevel = player.level;
  const xp = getMonsterXp(monster);

  player.xp += xp;

  const didLevelUp = player.level > previousLevel;
  if (didLevelUp) {
    player.healToFull();
  }

  return {
    xp,
    didLevelUp,
    level: player.level,
  };
}

export function rollLootDrop(monster?: Monster): Loot | null {
  const lootPool = monster?.lootPool;

  if (!roll(monster?.lootChance) || !lootPool?.length) {
    return null;
  }

  return { ...randomFrom(lootPool) };
}

function getMonsterXp(monster: Monster): number {
  return Math.floor((monster.xp ?? monster.hp + monster.attack) * Math.random()) + 1;
}
