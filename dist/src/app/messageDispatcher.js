import { sendGameText, sendPlainText } from "../game/messaging.js";
export async function dispatchMessages(device, recipientId, player, messages) {
    for (const message of messages) {
        if (message.type === "plain") {
            await sendPlainText(device, recipientId, message.text);
        }
        else {
            await sendGameText(device, recipientId, player, message.text, message.actions);
        }
    }
}
