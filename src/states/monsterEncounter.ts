import { COMMANDS, EVENT_ACTIONS, getCommandLabels, getDisplayActions } from "../game/commands.js";
import { rollCombatDamage } from "../game/combat.js";
import { Player } from "../game/player.js";
import { randomFrom } from "../game/random.js";
import { grantMonsterXp, rollLootDrop } from "../game/rewards.js";
import { gameMessage, plainMessage, result } from "../game/results.js";
import {
  combatRoundText,
  combatStatusText,
  lootDropText,
  monsterDefeatedText,
  monsterPrompt,
  monsterRewardText,
  TEXT,
} from "../game/text.js";
import { getLocation, locationSummaryMessage } from "./presenters.js";
import type { MonsterEncounter, Location, GameOutcome, MonsterCommand } from "../types.js";

export function handleMonsterEncounter(
  player: Player,
  command: MonsterCommand,
  event: MonsterEncounter,
): GameOutcome {
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

  return result([
    gameMessage(monsterPrompt(event.monster), getCommandLabels(EVENT_ACTIONS.monster)),
  ]);
}

function resolveCombatRound(player: Player, event: MonsterEncounter): GameOutcome {
  const monster = event.monster;
  const monsterDamage = rollCombatDamage(monster.attack);
  const playerDamage = rollCombatDamage(player.attack);

  monster.hp -= playerDamage;
  player.hp -= monsterDamage;

  const combatMessage = combatRoundText(monster, playerDamage, monsterDamage);

  if (player.hp <= 0) {
    Object.assign(player, new Player());
    return result([plainMessage(TEXT.YOU_DIED), locationSummaryMessage(getLocation(player))], {
      shouldSave: true,
    });
  }

  if (monster.hp <= 0) {
    const location = getLocation(player);
    const reward = grantMonsterXp(player, monster);
    const loot = rollLootDrop(location);
    player.encounter = null;

    if (loot) {
      player.encounter = { type: "item", item: loot };
      return result(
        [
          gameMessage(
            `${combatMessage}${monster.name} is defeated! ${monsterRewardText(reward)}`,
            [],
          ),
          gameMessage(lootDropText(loot), getCommandLabels(EVENT_ACTIONS.item)),
        ],
        { shouldSave: true },
      );
    }

    return result(
      [
        gameMessage(
          `${monsterDefeatedText(combatMessage, monster)} ${monsterRewardText(reward)} ${location.desc}`,
          getDisplayActions(location.actions),
        ),
      ],
      { shouldSave: true },
    );
  }

  return result(
    [
      gameMessage(
        combatStatusText(combatMessage, player, monster),
        getCommandLabels(EVENT_ACTIONS.monster),
      ),
    ],
    { shouldSave: true },
  );
}

function findRetreatLocation(location: Location): string | undefined {
  return randomFrom(Object.values(location.actions));
}
