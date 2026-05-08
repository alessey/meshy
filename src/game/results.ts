import type { GameMessage, PlainMessage, Message, GameOutcome } from "../types.js";

export function gameMessage(text: string, actions: string[] = []): GameMessage {
  return { type: "game", text, actions };
}

export function plainMessage(text: string): PlainMessage {
  return { type: "plain", text };
}

export function result(messages: Message[] = [], options: { shouldSave?: boolean } = {}): GameOutcome {
  return {
    messages,
    shouldSave: options.shouldSave ?? false,
  };
}
