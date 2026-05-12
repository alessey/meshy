import type { Message } from "../types.js";
import type { Destination } from "./types.js";

export interface MeshMessageContext {
  senderId: Destination;
  text: string;
  reply: (messages: Message[]) => Promise<void>;
}
