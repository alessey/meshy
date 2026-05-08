import { sendGameText, sendPlainText } from "../game/messaging.js";
import type { Player } from "../game/player.js";
import type { Message } from "../types.js";

type MeshDevice = {
  sendText(text: string, recipientId: unknown): Promise<number | void>;
};

export async function dispatchMessages(
  device: MeshDevice,
  recipientId: unknown,
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
