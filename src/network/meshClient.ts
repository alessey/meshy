import { MeshDevice, type Protobuf } from "@meshtastic/core";
import { TransportNode } from "@meshtastic/transport-node";
import { log } from "../logging.js";
import { DeviceStatusEnum } from "./types.js";

export class MeshClient {
  private host: string;
  private transport?: TransportNode;
  private device?: MeshDevice;
  private reconnectTimeout: number = 5000;
  private reconnecting: boolean = false;
  private onMessage: (senderId: string, text: string) => void;

  constructor(host: string, onMessage: (senderId: string, text: string) => void) {
    this.host = host;
    this.onMessage = onMessage;
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
      log(`Successfully connected to Meshtastic device at ${this.host}. Setting up listeners...`);

      this.setupListeners();
    } catch (err) {
      const error = err instanceof Error ? err.message : err;
      log("Connection failed, retrying in 5s...", error);

      setTimeout(() => this.handleReconnect(), this.reconnectTimeout);
    }
  }

  setupListeners() {
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

      this.onMessage(senderId, text);
    });
  }

  handleReconnect() {
    if (this.reconnecting) {
      return;
    }
    this.reconnecting = true;

    setTimeout(async () => {
      await this.connect();
      this.reconnecting = false;
    }, this.reconnectTimeout);
  }
}
