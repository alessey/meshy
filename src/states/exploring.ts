import { COMMANDS, getDisplayActions, isMovementCommand } from "../game/commands.js";
import { resolveLocationEvent } from "../game/encounters.js";
import { formatInventory } from "../game/inventory.js";
import { gameMessage, result } from "../game/results.js";
import { inventoryText } from "../game/text.js";
import {
  eventPromptMessage,
  getLocation,
  locationSummaryMessage,
  unknownCommandMessage,
} from "./presenters.js";
import type { Player } from "../game/player.js";
import type { Command, Direction, GameOutcome } from "../types.js";

export function handleExploring(player: Player, command: Command): GameOutcome {
  if (!command) {
    return result([locationSummaryMessage(getLocation(player))]);
  }

  if (isMovementCommand(command)) {
    return handleMovement(player, command);
  }

  if (command === COMMANDS.INVENTORY) {
    const inventory = formatInventory(player.inventory);
    const actions = getDisplayActions(getLocation(player).actions);
    return result([gameMessage(inventoryText(inventory), actions)]);
  }

  return result([unknownCommandMessage(player)]);
}

function handleMovement(player: Player, command: Direction): GameOutcome {
  const location = getLocation(player);
  const nextLocation = location.actions[command];

  if (!nextLocation) {
    return result([unknownCommandMessage(player)]);
  }

  player.location = nextLocation;
  player.encounter = null;

  return enterLocation(player, true);
}

export function enterLocation(player: Player, shouldSave: boolean = false): GameOutcome {
  const location = getLocation(player);
  const event = resolveLocationEvent(location, player);

  if (event) {
    player.encounter = event;
    return result([eventPromptMessage(event, player)], { shouldSave });
  }

  return result([locationSummaryMessage(location)], { shouldSave });
}
