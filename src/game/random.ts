export function roll(chance = 1) {
  return Math.random() < chance;
}

export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
