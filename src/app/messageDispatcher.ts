import { type MeshDevice } from "@meshtastic/core";
import { sendGameText, sendPlainText } from "../game/messaging.js";
import type { Player } from "../game/player.js";
import type { Message } from "../types.js";
import { type Destination } from "../network/types.js";

export async function dispatchMessages(
  device: MeshDevice,
  recipientId: Destination,
  player: Player,
  messages: Message[],
): Promise<void> {
  const messagePromises = messages.map(async (message) => {
    return message.type === "plain"
      ? sendPlainText(device, recipientId, message.text)
      : sendGameText(device, recipientId, player, message.text, message.actions);
  });

  await Promise.all(messagePromises);
}
