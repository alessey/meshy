import {
  Direction,
  ItemCommand,
  MonsterCommand,
  PotionCommand,
  InventoryCommand,
  Command,
  PlayCommand,
  LocationActions,
} from "../types.js";

export const COMMANDS = {
  MOVE_NORTH: "n",
  MOVE_SOUTH: "s",
  MOVE_EAST: "e",
  MOVE_WEST: "w",
  INVENTORY: "i",
  TAKE: "t",
  DISCARD: "d",
  FIGHT: "f",
  RUN: "r",
  USE: "u",
  PLAY: "play",
} as const;

export const MOVEMENT_COMMANDS = [
  COMMANDS.MOVE_NORTH,
  COMMANDS.MOVE_SOUTH,
  COMMANDS.MOVE_EAST,
  COMMANDS.MOVE_WEST,
];

export const GAME_ACTIONS = [COMMANDS.PLAY];

export const EVENT_ACTIONS = {
  item: [COMMANDS.TAKE, COMMANDS.DISCARD],
  monster: [COMMANDS.FIGHT, COMMANDS.RUN],
  potion: [COMMANDS.USE, COMMANDS.DISCARD],
  inventory: [COMMANDS.INVENTORY],
};

export function isMovementCommand(command: string): command is Direction {
  return MOVEMENT_COMMANDS.includes(command as Direction);
}

export function isGameCommand(command: string): command is PlayCommand {
  return (GAME_ACTIONS as readonly string[]).includes(command);
}

export function isItemCommand(command: string): command is ItemCommand {
  return (EVENT_ACTIONS.item as readonly string[]).includes(command);
}

export function isMonsterCommand(command: string): command is MonsterCommand {
  return (EVENT_ACTIONS.monster as readonly string[]).includes(command);
}

export function isPotionCommand(command: string): command is PotionCommand {
  return (EVENT_ACTIONS.potion as readonly string[]).includes(command);
}

export function isInventoryCommand(command: string): command is InventoryCommand {
  return (EVENT_ACTIONS.inventory as readonly string[]).includes(command);
}

export function isCommand(command: string): command is Command {
  return (
    isGameCommand(command) ||
    isMovementCommand(command) ||
    isItemCommand(command) ||
    isMonsterCommand(command) ||
    isPotionCommand(command) ||
    isInventoryCommand(command)
  );
}

export function getDisplayActions(actions: LocationActions): string[] {
  return Object.keys(actions).map((dir) => dir.toUpperCase());
}

export function getCommandLabels(commands: string[]): string[] {
  return commands.map((command) => command.toUpperCase());
}
