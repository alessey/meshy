import { type MeshDevice } from "@meshtastic/core";
import { CHAR_LIMIT, USE_MOCK } from "../config/constants.js";
import { log, logError } from "../logging.js";
import type { Player } from "./player.js";
import { type Destination } from "../network/types.js";

export function formatResponse(player: Player, text: string, actions: string[] = []): string {
  const status = `[L${player.level} XP:${player.xp} HP:${player.hp}/${player.maxHp} ATK:${player.attack}]`;
  const actionList = actions.length ? ` [${actions.join(", ")}]` : "";
  return `${status} ${text}${actionList}`;
}

export function truncateMessage(text: string): string {
  return text.length > CHAR_LIMIT ? text.substring(0, CHAR_LIMIT - 3) + "..." : text;
}

export async function sendGameText(
  device: MeshDevice,
  recipientId: Destination,
  player: Player,
  text: string,
  actions: string[] = [],
): Promise<void> {
  const safeText = truncateMessage(formatResponse(player, text, actions));
  return sendText(device, recipientId, safeText);
}

export async function sendPlainText(
  device: MeshDevice,
  recipientId: Destination,
  text: string,
): Promise<void> {
  return sendText(device, recipientId, truncateMessage(text));
}

async function sendText(
  device: MeshDevice,
  recipientId: Destination,
  safeText: string,
): Promise<void> {
  log(`Outgoing to ${recipientId}: ${safeText}`);

  if (!USE_MOCK) {
    try {
      await device.sendText(safeText, recipientId, true);
    } catch (e) {
      logError(`Send Error:`, e);
    }
  }
}
