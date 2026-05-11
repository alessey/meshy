import { randomFrom, roll } from "./random.js";
import { scaleMonster } from "./rewards.js";

import type { Location, Encounter } from "../types.js";
import type { Player } from "./player.js";

export function resolveLocationEvent(location: Location, player: Player): Encounter | null {
  const eventConfigs: { chance: number; build: () => Encounter | null }[] = [
    {
      chance: location.itemChance ?? 0,
      build: () => {
        const item = randomFrom(location.itemPool ?? []);
        return item ? { type: "item", item: { ...item } } : null;
      },
    },
    {
      chance: location.monsterChance ?? 0,
      build: () => {
        const monster = randomFrom(location.monsterPool ?? []);
        return monster
          ? {
              type: "monster",
              monster: scaleMonster(monster, player),
            }
          : null;
      },
    },
    {
      chance: location.potionChance ?? 0,
      build: () => ({
        type: "potion",
        potion: { name: "Health Potion", heal: location.potionHeal ?? 10 },
      }),
    },
  ];

  for (const { chance, build } of eventConfigs) {
    if (roll(chance)) {
      const event = build();
      if (event) {
        return event;
      }
    }
  }

  return null;
}
