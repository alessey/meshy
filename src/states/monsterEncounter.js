import { EVENT_ACTIONS, getDisplayActions } from "../game/commands.js";
import { rollCombatDamage } from "../game/combat.js";
import { Player } from "../game/player.js";
import { randomFrom } from "../game/random.js";
import { gameMessage, plainMessage, result } from "../game/results.js";
import { getLocation, locationSummaryMessage } from "./presenters.js";

export function handleMonsterEncounter(player, command, event) {
  const location = getLocation(player);

  if (command === "f") {
    return resolveCombatRound(player, event);
  }

  if (command === "r") {
    const retreat = findRetreatLocation(location);
    if (retreat) {
      player.location = retreat;
    }

    player.encounter = null;
    return result([locationSummaryMessage(getLocation(player))], { shouldSave: true });
  }

  return result([gameMessage(`A ${event.monster.name} appears! (F)ight or (R)un?`, EVENT_ACTIONS.monster)]);
}

function resolveCombatRound(player, event) {
  const monster = event.monster;
  const monsterDamage = rollCombatDamage(monster.attack);
  const playerDamage = rollCombatDamage(player.weapon.attack);

  monster.hp -= playerDamage;
  player.hp -= monsterDamage;

  const combatMessage = `You hit ${monster.name} for ${playerDamage}. ${monster.name} hits you for ${monsterDamage}. `;

  if (player.hp <= 0) {
    Object.assign(player, new Player());
    return result(
      [
        plainMessage("You died!"),
        locationSummaryMessage(getLocation(player)),
      ],
      { shouldSave: true }
    );
  }

  if (monster.hp <= 0) {
    const location = getLocation(player);
    player.encounter = null;
    return result(
      [
        gameMessage(
          `${combatMessage}${monster.name} is defeated! ${location.desc}`,
          getDisplayActions(location.actions)
        ),
      ],
      { shouldSave: true }
    );
  }

  return result(
    [
      gameMessage(
        `${combatMessage}Your HP: ${player.hp}. Monster HP: ${monster.hp}. (F)ight or (R)un?`,
        EVENT_ACTIONS.monster
      ),
    ],
    { shouldSave: true }
  );
}

function findRetreatLocation(location) {
  return randomFrom(Object.values(location.actions));
}
