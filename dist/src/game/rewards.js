import { getLevelMultiplier } from "./levels.js";
import { randomFrom, roll } from "./random.js";
export const LOOT_DROP_CHANCE = 0.2;
const DEFAULT_LOOT_POOL = [
    { name: "Rusty Dagger", attack: 4 },
    { name: "Padded Vest", hp: 2 },
    { name: "Short Sword", attack: 6 },
];
export function scaleMonster(monster, player) {
    const multiplier = getLevelMultiplier(player);
    return {
        ...monster,
        hp: Math.ceil(monster.hp * multiplier),
        attack: Math.ceil(monster.attack * multiplier),
        xp: Math.ceil(getBaseMonsterXp(monster) * multiplier),
    };
}
export function grantMonsterXp(player, monster) {
    const previousLevel = player.level;
    const xp = monster.xp ?? getBaseMonsterXp(monster);
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
export function rollLootDrop(location) {
    const lootPool = location.itemPool?.length ? location.itemPool : DEFAULT_LOOT_POOL;
    if (!roll(LOOT_DROP_CHANCE)) {
        return null;
    }
    return { ...randomFrom(lootPool) };
}
function getBaseMonsterXp(monster) {
    return monster.xp ?? monster.hp + monster.attack;
}
