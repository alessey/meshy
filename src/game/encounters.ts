import { randomFrom, roll } from "./random.js";

import type { Location, Encounter, Loot } from "../types.js";
import type { Player } from "./player.js";
import { getLevelMultiplier } from "./levels.js";

// some loot types scale based on players level
function isScalableLoot(loot: Loot): boolean {
  return loot.type === "potion" || loot.type === "weapon" || loot.type === "armor";
}

function scaleLoot(loot: Loot, player: Player): Loot {
  const multiplier = getLevelMultiplier(player);
  const scale = (num: number) => Math.ceil(num * multiplier);
  if (isScalableLoot(loot)) {
    return {
      ...loot,
      ...(loot.type === "weapon" && { attack: scale(loot.attack) }),
      ...(loot.type === "armor" && { hp: scale(loot.hp) }),
      ...(loot.type === "potion" && { heal: scale(loot.heal) }),
    };
  }
  return loot;
}

export function resolveLocationEvent(location: Location, player: Player): Encounter | null {
  const chance = location.encounterChance ?? 0;
  if (roll(chance)) {
    const encounter = randomFrom(location.encounterPool ?? []);
    if (encounter) {
      if (encounter.type === "item") {
        encounter.item = scaleLoot(encounter.item, player);
      }
      return encounter;
    }
  }

  return null;
}
