import { MeshDevice, type Protobuf } from "@meshtastic/core";
import { TransportNode } from "@meshtastic/transport-node";
import { log, logError } from "../logging.js";
import { DeviceStatusEnum, type MeshMessageContext } from "./types.js";
import { type Message } from "../types.js";

const MAX_RETRY_ATTEMPTS = 3;
const RECONNECT_TIMEOUT = 5_000;
const RESEND_DELAY = 1_000;

export class MeshClient {
  private host: string;
  private transport?: TransportNode;
  private device?: MeshDevice;
  private connectionPromise: Promise<void> | undefined;
  private onMessageWithContext: (ctx: MeshMessageContext) => void;

  constructor(host: string, onMessageWithContext: (ctx: MeshMessageContext) => void) {
    this.host = host;
    this.onMessageWithContext = onMessageWithContext;
  }

  get meshDevice(): MeshDevice | undefined {
    return this.device;
  }

  async createConnection() {
    log("Connecting to Meshtastic device...");
    this.transport = await TransportNode.create(this.host);
    log("Transport connection established");

    this.device = new MeshDevice(this.transport);
    this.setupListeners();

    log("Configuring MeshDevice...");
    await this.device.configure();

    log(`Successfully connected to Meshtastic device at ${this.host}.`);
  }

  async connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.createConnection().catch((err) => {
      const error = err instanceof Error ? err.message : err;
      logError(`Connection failed: ${error}`);

      this.handleReconnect();
    });
    return this.connectionPromise;
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
      log("Status changed:", DeviceStatusEnum[status]);

      if (status === DeviceStatusEnum.DeviceDisconnected) {
        logError("Device disconnected. Reconnecting...");
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
          await this.sendMessage(senderId, message.text);
        }
      };

      this.onMessageWithContext({ senderId, text, reply: replyFunction });
    });

    log("Message handler set up.");
  }

  async sendMessage(recipientId: number | "self" | "broadcast", text: string): Promise<void> {
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        if (!this.device) {
          await this.handleReconnect();
        }

        if (!this.device) {
          throw new Error("Device not connected");
        }

        await this.device.sendText(text, recipientId);
        return;
      } catch (err) {
        const error = err instanceof Error ? err.message : err;
        log(`Send attempt ${attempt}/${MAX_RETRY_ATTEMPTS} failed: ${error}`);

        if (attempt < MAX_RETRY_ATTEMPTS) {
          // wait 1s, try again
          await new Promise((resolve) => setTimeout(resolve, RESEND_DELAY));
        }
      }
    }
  }

  async handleReconnect() {
    // reset connection
    this.connectionPromise = undefined;

    log(`Reconnecting in ${RECONNECT_TIMEOUT / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, RECONNECT_TIMEOUT));
  }
}
