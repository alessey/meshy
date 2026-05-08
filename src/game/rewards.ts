import { getLevelMultiplier } from "./levels.js";
import { randomFrom, roll } from "./random.js";
import type { Monster, Location, MonsterReward } from "../types.js";
import { Player } from "./player.js";

export const LOOT_DROP_CHANCE = 0.2;
const DEFAULT_LOOT_POOL = [
  { name: "Rusty Dagger", attack: 4 },
  { name: "Padded Vest", hp: 2 },
  { name: "Short Sword", attack: 6 },
];

export function scaleMonster(monster: Monster, player: Player): Monster {
  const multiplier = getLevelMultiplier(player);
  return {
    ...monster,
    hp: Math.ceil(monster.hp * multiplier),
    attack: Math.ceil(monster.attack * multiplier),
    xp: Math.ceil(getMonsterXp(monster) * multiplier),
  };
}

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

export function rollLootDrop(
  location: Location,
): { name: string; attack?: number; hp?: number } | null {
  const lootPool = location.itemPool?.length ? location.itemPool : DEFAULT_LOOT_POOL;

  if (!roll(LOOT_DROP_CHANCE)) {
    return null;
  }

  return { ...randomFrom(lootPool) };
}

function getMonsterXp(monster: Monster): number {
  return (monster.xp ?? monster.hp + monster.attack) * Math.random();
}
