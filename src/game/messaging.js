import { CHAR_LIMIT, USE_MOCK } from "../../constants.js";
import { logError } from "../../logging.js";

export function formatResponse(player, text, actions = []) {
  const status = `[HP: ${player.hp}, ATK: ${player.weapon.attack}]`;
  const actionList = actions.length ? ` [${actions.join(", ")}]` : "";
  return `${status} ${text}${actionList}`;
}

export function truncateMessage(text) {
  return text.length > CHAR_LIMIT ? text.substring(0, CHAR_LIMIT - 3) + "..." : text;
}

export async function sendGameText(device, recipientId, player, text, actions = []) {
  const safeText = truncateMessage(formatResponse(player, text, actions));
  return sendText(device, recipientId, safeText);
}

export async function sendPlainText(device, recipientId, text) {
  return sendText(device, recipientId, truncateMessage(text));
}

async function sendText(device, recipientId, safeText) {
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
