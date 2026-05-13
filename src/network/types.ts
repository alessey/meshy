import type { Message } from "../types.js";

export type Destination = number | "self" | "broadcast";

export enum DeviceStatusEnum {
  DeviceRestarting = 1,
  DeviceDisconnected = 2,
  DeviceConnecting = 3,
  DeviceReconnecting = 4,
  DeviceConnected = 5,
  DeviceConfiguring = 6,
  DeviceConfigured = 7,
}

export type MeshMessageContext = {
  senderId: Destination;
  text: string;
  reply: (messages: Message[]) => Promise<void>;
};
