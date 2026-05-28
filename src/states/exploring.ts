import { getDisplayActions, isSystemCommand, isMovementCommand } from "../game/commands.js";
import { resolveLocationEvent } from "../game/encounters.js";
import { gameMessage, result } from "../game/results.js";
import { requirementText } from "../game/text.js";
import {
  eventPromptMessage,
  getLocation,
  locationSummaryMessage,
  unknownCommandMessage,
} from "./presenters.js";
import type { Player } from "../game/player.js";
import type { Command, Direction, Encounter, GameOutcome } from "../types.js";
import worldMap from "../world/map.js";

export function handleExploring(player: Player, command: Command): GameOutcome {
  if (!command || isSystemCommand(command)) {
    return result([locationSummaryMessage(getLocation(player))]);
  }

  if (isMovementCommand(command)) {
    return handleMovement(player, command);
  }

  return result([unknownCommandMessage(player)]);
}

function handleMovement(player: Player, command: Direction): GameOutcome {
  const location = getLocation(player);
  const nextLocationKey = location.actions[command];

  if (!nextLocationKey) {
    return result([unknownCommandMessage(player)]);
  }

  const nextLocation = worldMap[nextLocationKey as keyof typeof worldMap];
  const requirement = nextLocation?.requiredItem;

  if (requirement) {
    const hasItem = player.hasItem(requirement);
    const hasWeapon = player.hasWeapon(requirement);

    if (!hasItem && !hasWeapon) {
      const message = gameMessage(
        requirementText(requirement),
        getDisplayActions(location.actions),
      );
      return result([message], { shouldSave: false });
    }
  }

  player.location = nextLocationKey;
  player.encounter = null;

  return enterLocation(player, true);
}

function isPotionEventWithFullHealth(player: Player, event: Encounter): boolean {
  return event?.type === "item" && event.item.type === "potion" && player.hp === player.maxHp;
}

export function enterLocation(player: Player, shouldSave: boolean = false): GameOutcome {
  const location = getLocation(player);
  const event = resolveLocationEvent(location, player);

  // skip potion events if the player is already at full health
  if (event && !isPotionEventWithFullHealth(player, event)) {
    player.encounter = event;
    return result([eventPromptMessage(event, player)], { shouldSave });
  }

  return result([locationSummaryMessage(location)], { shouldSave });
}
