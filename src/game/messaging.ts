import { CHAR_LIMIT, USE_MOCK } from "../config/constants.js";
import { logError } from "../logging.js";
import type { Player } from "./player.js";

export function formatResponse(player: Player, text: string, actions: string[] = []): string {
  const status = `[L${player.level} XP:${player.xp} HP:${player.hp}/${player.maxHp} ATK:${player.attack}]`;
  const actionList = actions.length ? ` [${actions.join(", ")}]` : "";
  return `${status} ${text}${actionList}`;
}

export function truncateMessage(text: string): string {
  return text.length > CHAR_LIMIT ? text.substring(0, CHAR_LIMIT - 3) + "..." : text;
}

export async function sendGameText(device: any, recipientId: unknown, player: Player, text: string, actions: string[] = []): Promise<void> {
  const safeText = truncateMessage(formatResponse(player, text, actions));
  return sendText(device, recipientId, safeText);
}

export async function sendPlainText(device: any, recipientId: unknown, text: string): Promise<void> {
  return sendText(device, recipientId, truncateMessage(text));
}

async function sendText(device: any, recipientId: unknown, safeText: string): Promise<void> {
  if (USE_MOCK) {
    process.stdout.write(`\n[OUTGOING TO ${recipientId}]: ${safeText}\n> `);
  } else {
    try {
      await device.sendText(safeText, recipientId);
    } catch (e) {
      logError(`Send Error:`, e);
    }
  }
}
