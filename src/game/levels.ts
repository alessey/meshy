import { type Player } from "./player.js";

export const LEVELS = [
  { level: 1, minXp: 0, multiplier: 1 },
  { level: 2, minXp: 10, multiplier: 1.1 },
  { level: 3, minXp: 25, multiplier: 1.2 },
  { level: 4, minXp: 50, multiplier: 1.3 },
  { level: 5, minXp: 90, multiplier: 1.4 },
  { level: 6, minXp: 140, multiplier: 1.6 },
  { level: 7, minXp: 200, multiplier: 1.8 },
  { level: 8, minXp: 300, multiplier: 2 },
];

type LevelInfo = {
  level: number;
  minXp: number;
  multiplier: number;
};

export function getLevelForXp(xp: number): LevelInfo {
  return LEVELS.reduce((currentLevel: LevelInfo, level: LevelInfo) => {
    return xp >= level.minXp ? level : currentLevel;
  }, LEVELS[0]);
}

export function getLevel(player: Player): LevelInfo {
  return getLevelForXp(player.xp);
}

export function getLevelMultiplier(player: Player): number {
  return getLevel(player).multiplier;
}
