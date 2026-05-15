import { CHAR_LIMIT } from "../config/constants.js";
import type { Player } from "../game/player.js";
import type { GameMessage, PlainMessage } from "../types.js";

function truncateMessage(text: string): string {
  return text.length > CHAR_LIMIT ? text.substring(0, CHAR_LIMIT - 3) + "..." : text;
}

function formatGameMessage(player: Player, message: GameMessage): GameMessage {
  const status = `[L${player.level} XP:${player.xp} HP:${player.hp}/${player.maxHp} ATK:${player.attack}]`;
  const actionList = message.actions.length ? ` [${message.actions.join(", ")}]` : "";

  return {
    ...message,
    text: truncateMessage(`${status} ${message.text}${actionList}`),
  };
}

function formatPlainMessage(message: PlainMessage): PlainMessage {
  return {
    ...message,
    text: truncateMessage(message.text),
  };
}

export function formatMessage<T extends GameMessage | PlainMessage>(player: Player, message: T): T {
  if ("actions" in message) {
    return formatGameMessage(player, message) as T;
  }
  return formatPlainMessage(message) as T;
}
