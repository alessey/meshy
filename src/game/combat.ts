export function rollCombatDamage(attackerAttack: number): number {
  return Math.max(1, Math.floor(Math.random() * attackerAttack) + 1);
}
