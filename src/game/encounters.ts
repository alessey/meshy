import { randomFrom, roll } from "./random.js";
import { scaleMonster } from "./rewards.js";

import type { Location, Encounter } from "../types.js";
import type { Player } from "./player.js";

export function resolveLocationEvent(location: Location, player: Player): Encounter | null {
  const eventTypes = [
    {
      pool: location.itemPool,
      chance: location.itemChance ?? 0,
      build: () => ({ type: "item", item: { ...randomFrom(location.itemPool) } }),
    },
    {
      pool: location.monsterPool,
      chance: location.monsterChance ?? 0,
      build: () => ({ type: "monster", monster: scaleMonster(randomFrom(location.monsterPool), player) }),
    },
    {
      chance: location.potionChance ?? 0,
      build: () => ({ type: "potion", potion: { name: "Health Potion", heal: location.potionHeal ?? 10 } }),
    },
  ];

  for (const { pool, chance, build } of eventTypes) {
    if (pool?.length && roll(chance)) {
      return build() as Encounter;
    }
  }

  return null;
}
