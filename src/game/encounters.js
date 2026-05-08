import { randomFrom, roll } from "./random.js";

export function resolveLocationEvent(location) {
  const eventTypes = [
    {
      pool: location.itemPool,
      chance: location.itemChance ?? 0,
      build: () => ({ type: "item", item: { ...randomFrom(location.itemPool) } }),
    },
    {
      pool: location.monsterPool,
      chance: location.monsterChance ?? 0,
      build: () => ({ type: "monster", monster: { ...randomFrom(location.monsterPool) } }),
    },
    {
      chance: location.potionChance ?? 0,
      build: () => ({ type: "potion", potion: { name: "Health Potion", heal: location.potionHeal ?? 10 } }),
    },
  ];

  for (const { pool, chance, build } of eventTypes) {
    if (pool?.length && roll(chance)) {
      return build();
    }
  }

  return null;
}
