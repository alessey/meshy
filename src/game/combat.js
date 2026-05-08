export function rollCombatDamage(attackerAttack) {
  return Math.max(1, Math.floor(Math.random() * attackerAttack) + 1);
}
