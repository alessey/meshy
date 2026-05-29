import { COMMANDS, EVENT_ACTIONS, getCommandLabels } from "../game/commands.js";
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
    Object.assign(player, new Player(player.id));
    return result(
      [
        plainMessage(`${monster.name} hits for ${monsterDamage} damage.`),
        plainMessage(TEXT.YOU_DIED),
        plainMessage(TEXT.PLAY_AGAIN),
      ],
      { shouldSave: true },
    );
  }

  if (monster.hp <= 0) {
    const reward = grantMonsterXp(player, monster);
    const loot = rollLootDrop(monster);
    player.clearedLocations.push(player.location);
    player.encounter = null;

    if (loot) {
      player.encounter = { type: "item", item: loot };
      return result(
        [
          gameMessage(
            `${monsterDefeatedText(combatMessage, monster)} ${monsterRewardText(reward)}`,
            [],
          ),
          gameMessage(
            lootDropText(loot),
            getCommandLabels(loot.type === "potion" ? EVENT_ACTIONS.potion : EVENT_ACTIONS.item),
          ),
        ],
        { shouldSave: true },
      );
    }

    if (monster.hasWon) {
      const resultMessage = result(
        [
          gameMessage(
            `${monsterDefeatedText(combatMessage, monster)} ${monsterRewardText(reward)}`,
            [],
          ),
          plainMessage(TEXT.YOU_WON),
          plainMessage(TEXT.PLAY_AGAIN),
        ],
        { shouldSave: true },
      );
      Object.assign(player, new Player(player.id));

      return resultMessage;
    }

    return result(
      [
        gameMessage(
          `${monsterDefeatedText(combatMessage, monster)} ${monsterRewardText(reward)}`,
          [],
        ),
        locationSummaryMessage(getLocation(player)),
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
