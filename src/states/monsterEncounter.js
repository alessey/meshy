import { COMMANDS, EVENT_ACTIONS, getCommandLabels, getDisplayActions } from "../game/commands.js";
import { rollCombatDamage } from "../game/combat.js";
import { Player } from "../game/player.js";
import { randomFrom } from "../game/random.js";
import { gameMessage, plainMessage, result } from "../game/results.js";
import { combatRoundText, combatStatusText, monsterDefeatedText, monsterPrompt, TEXT } from "../game/text.js";
import { getLocation, locationSummaryMessage } from "./presenters.js";

export function handleMonsterEncounter(player, command, event) {
  const location = getLocation(player);

  if (command === COMMANDS.FIGHT) {
    return resolveCombatRound(player, event);
  }

  if (command === COMMANDS.RUN) {
    const retreat = findRetreatLocation(location);
    if (retreat) {
      player.location = retreat;
    }

    player.encounter = null;
    return result([locationSummaryMessage(getLocation(player))], { shouldSave: true });
  }

  return result([gameMessage(monsterPrompt(event.monster), getCommandLabels(EVENT_ACTIONS.monster))]);
}

function resolveCombatRound(player, event) {
  const monster = event.monster;
  const monsterDamage = rollCombatDamage(monster.attack);
  const playerDamage = rollCombatDamage(player.weapon.attack);

  monster.hp -= playerDamage;
  player.hp -= monsterDamage;

  const combatMessage = combatRoundText(monster, playerDamage, monsterDamage);

  if (player.hp <= 0) {
    Object.assign(player, new Player());
    return result(
      [
        plainMessage(TEXT.YOU_DIED),
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
          monsterDefeatedText(combatMessage, monster, location),
          getDisplayActions(location.actions)
        ),
      ],
      { shouldSave: true }
    );
  }

  return result(
    [
      gameMessage(
        combatStatusText(combatMessage, player, monster),
        getCommandLabels(EVENT_ACTIONS.monster)
      ),
    ],
    { shouldSave: true }
  );
}

function findRetreatLocation(location) {
  return randomFrom(Object.values(location.actions));
}
