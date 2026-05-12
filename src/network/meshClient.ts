import { MeshDevice, type Protobuf } from "@meshtastic/core";
import { TransportNode } from "@meshtastic/transport-node";
import { log } from "../logging.js";
import { DeviceStatusEnum } from "./types.js";
import { type MeshMessageContext } from "./messageContext.js";
import { type Message } from "../types.js";

export class MeshClient {
  private host: string;
  private transport?: TransportNode;
  private device?: MeshDevice;
  private reconnectTimeout: number = 5000;
  private connecting: boolean = false;
  private onMessageWithContext: (ctx: MeshMessageContext) => void; // New property for context handler

  constructor(host: string, onMessageWithContext: (ctx: MeshMessageContext) => void) {
    this.host = host;
    this.onMessageWithContext = onMessageWithContext;
  }

  get meshDevice(): MeshDevice | undefined {
    return this.device;
  }

  async connect() {
    try {
      this.transport = await TransportNode.create(this.host);
      log("Transport connection established");

      this.device = new MeshDevice(this.transport);
      log("Configuring MeshDevice...");

      await this.device.configure();
      log(`Successfully connected to Meshtastic device at ${this.host}.`);

      this.setupListeners();

      this.connecting = false;
    } catch (err) {
      const error = err instanceof Error ? err.message : err;
      log("Connection failed, retrying in 5s...", error);

      setTimeout(() => this.handleReconnect(), this.reconnectTimeout);
    }
  }

  setupListeners() {
    log("Setting up device listeners...");

    this.setupDeviceStatusHandler();
    this.setupMessageHandler();
  }

  setupDeviceStatusHandler() {
    if (!this.device) {
      log("Device not initialized, call connect first");
      return;
    }

    this.device.events.onDeviceStatus.subscribe((status: DeviceStatusEnum) => {
      console.log("Status changed:", DeviceStatusEnum[status]);

      if (status === DeviceStatusEnum.DeviceDisconnected) {
        console.warn("Socket timed out or lost. Reconnecting...");
        this.handleReconnect();
      }
    });

    log("Device status handler set up.");
  }

  setupMessageHandler() {
    if (!this.device) {
      log("Device not initialized, call connect first");
      return;
    }

    this.device.events.onMessagePacket.subscribe(async (packet: Protobuf.Mesh.IMeshPacket) => {
      if (!packet.data || !packet.data.startsWith("/")) {
        return;
      }

      const senderId = packet.from.toString();
      const text = packet.data;

      const replyFunction = async (messages: Message[]) => {
        if (!this.device) {
          log("Attempted to reply but device is not connected.");
          return;
        }
        for (const message of messages) {
          log(`Replying to ${senderId}: ${message.text}`);
          // eslint-disable-next-line no-await-in-loop
          await this.sendMessage(senderId, message.text);
        }
      };

      this.onMessageWithContext({ senderId, text, reply: replyFunction });
    });

    log("Message handler set up.");
  }

  async sendMessage(recipientId: number | "self" | "broadcast", text: string): Promise<void> {
    if (!this.device) {
      await this.handleReconnect();
    }

    if (!this.device) {
      log("Unable to send message: Device not connected");
      return;
    }

    this.device.sendText(text, recipientId).catch((err) => {
      const error = err instanceof Error ? err.message : err;
      log("Send failed:", error);
    });
  }

  async handleReconnect() {
    if (this.connecting) {
      return;
    }
    this.connecting = true;
    return await this.connect();
  }
}
