export const MOVEMENT_COMMANDS = ["M", "S", "E", "W"];

export const EVENT_ACTIONS = {
  item: ["T", "D"],
  monster: ["F", "R"],
  potion: ["U", "D"],
  inventory: ["I"],
};

export function isMovementCommand(command) {
  return MOVEMENT_COMMANDS.includes(command.toUpperCase());
}

export function getDisplayActions(actions) {
  return Object.keys(actions).map((dir) => dir.toUpperCase());
}
