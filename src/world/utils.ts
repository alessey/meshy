import worldMap from "./map.js";

export function getStartLocationKey(): string {
  const startEntry = Object.entries(worldMap).find(([, loc]) => loc.isStart);
  // Fallback to the first key in the map if no 'isStart' is defined
  return startEntry ? startEntry[0] : Object.keys(worldMap)[0];
}
