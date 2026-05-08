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
};

export const MOVEMENT_COMMANDS = [
  COMMANDS.MOVE_NORTH,
  COMMANDS.MOVE_SOUTH,
  COMMANDS.MOVE_EAST,
  COMMANDS.MOVE_WEST,
];

export const EVENT_ACTIONS = {
  item: [COMMANDS.TAKE, COMMANDS.DISCARD],
  monster: [COMMANDS.FIGHT, COMMANDS.RUN],
  potion: [COMMANDS.USE, COMMANDS.DISCARD],
  inventory: [COMMANDS.INVENTORY],
};

export function isMovementCommand(command) {
  return MOVEMENT_COMMANDS.includes(command);
}

export function getDisplayActions(actions) {
  return Object.keys(actions).map((dir) => dir.toUpperCase());
}

export function getCommandLabels(commands) {
  return commands.map((command) => command.toUpperCase());
}
