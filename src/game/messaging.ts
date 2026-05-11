/* eslint-disable no-await-in-loop */
import type { Protobuf, MeshDevice } from "@meshtastic/core";
import { CHAR_LIMIT, USE_MOCK } from "../config/constants.js";
import { log, logError } from "../logging.js";
import type { Player } from "./player.js";
import { type Destination } from "../network/types.js";
import { filter, firstValueFrom, timer, map } from "rxjs";

const MAX_RETRIES = 1;
const ACK_TIMEOUT_MS = 60_000; // 60 seconds is safer for mesh hops

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
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const packetId = await device.sendText(safeText, recipientId, true);
        log(`[Attempt ${attempt}/${MAX_RETRIES}] Sent to ${recipientId}. Packet ID: ${packetId}`);

        const ackPromise = firstValueFrom(
          device.events.onFromRadio.pipe(
            filter((packet: Protobuf.Mesh.IMeshPacket) => packet.requestId === packetId),
            map((packet: Protobuf.Mesh.IMeshPacket) => {
              if (packet.routing?.variant?.case === "ack") {
                return { success: true };
              }
              if (packet.routing?.errorReason) {
                throw new Error(`NACK: ${packet.routing.errorReason}`);
              }
              return { success: false };
            }),
          ),
        );

        const timeoutPromise = firstValueFrom(
          timer(ACK_TIMEOUT_MS).pipe(
            map(() => {
              throw new Error("Timeout waiting for ACK");
            }),
          ),
        );

        // Race the ACK against the timer
        await Promise.race([ackPromise, timeoutPromise]);

        log(`✅ Message ${packetId} acknowledged by ${recipientId}`);
        return; // Success, exit function
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        logError(`[Attempt ${attempt}] Failed to send to ${recipientId}: ${errorMsg}`);

        if (attempt === MAX_RETRIES) {
          logError(`Maximum retries reached for ${recipientId}. Giving up.`);
        } else {
          // Exponential backoff: wait longer between each retry
          const backoff = attempt * 2000;
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
      }
    }
  }
}
