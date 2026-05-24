import { randomFrom, roll } from "./random.js";
import { scaleMonster } from "./rewards.js";

import type { Location, Encounter } from "../types.js";
import type { Player } from "./player.js";

export function resolveLocationEvent(location: Location, player: Player): Encounter | null {
  const chance = location.encounterChance ?? 0;
  if (roll(chance)) {
    const encounter = randomFrom(location.encounterPool ?? []);
    if (encounter) {
      if (encounter.type === "monster") {
        return {
          ...encounter,
          monster: scaleMonster(encounter.monster, player),
        };
      }
      return encounter;
    }
  }

  return null;
}
