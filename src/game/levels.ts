export const LEVELS = [
  { level: 1, minXp: 0, multiplier: 1 },
  { level: 2, minXp: 10, multiplier: 1.15 },
  { level: 3, minXp: 25, multiplier: 1.3 },
  { level: 4, minXp: 50, multiplier: 1.5 },
  { level: 5, minXp: 90, multiplier: 1.75 },
  { level: 6, minXp: 140, multiplier: 2 },
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

export function getLevel(player: any): LevelInfo {
  return getLevelForXp(player.xp);
}

export function getLevelMultiplier(player: any): number {
  return getLevel(player).multiplier;
}
