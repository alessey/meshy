import { sendGameText, sendPlainText } from "../game/messaging.js";
import type { Player } from "../game/player.js";
import type { Message } from "../types.js";

interface MeshDevice {
  sendText(text: string, recipientId: unknown): Promise<number | void>;
}

export async function dispatchMessages(device: MeshDevice, recipientId: unknown, player: Player, messages: Message[]): Promise<void> {
  for (const message of messages) {
    if (message.type === "plain") {
      await sendPlainText(device, recipientId, message.text);
    } else {
      await sendGameText(device, recipientId, player, message.text, message.actions);
    }
  }
}
