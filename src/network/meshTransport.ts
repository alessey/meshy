import { TransportNode } from "@meshtastic/transport-node";
import { type Protobuf, MeshDevice } from "@meshtastic/core";
import { log, logError } from "../logging.js";
import { DEVICE_IP } from "../config/constants.js";
import type { Destination } from "./types.js";

/**
 * Initializes the connection to the Meshtastic node and sets up listeners.
 * @param onMessage Callback triggered when a valid game command (starting with '/') is received.
 */
export async function initTransport(
  onMessage: (senderId: string, text: string) => void,
): Promise<MeshDevice> {
  try {
    if (!DEVICE_IP) {
      throw new Error("DEVICE_IP is not defined in environment variables.");
    }

    log(`Initializing transport to Meshtastic node at ${DEVICE_IP}...`);
    const transport = await TransportNode.create(DEVICE_IP);
    log("Transport connection established");
    const meshDevice = new MeshDevice(transport);
    log("Configuring MeshDevice...");
    await meshDevice.configure();
    log("Successfully connected to Meshtastic node. Setting up listeners...");

    meshDevice.events.onMessagePacket.subscribe(async (packet: Protobuf.Mesh.IMeshPacket) => {
      if (!packet.data || !packet.data.startsWith("/")) {
        return;
      }

      const senderId = packet.from.toString();
      const text = packet.data;

      onMessage(senderId, text);
    });

    let testPacketId: number | null = null;
    try {
      meshDevice.events.onRoutingPacket.subscribe(async (packet: Protobuf.Mesh.IRoutingPacket) => {
        log("Received routing packet:", packet, testPacketId === packet.requestId);
      });
    } catch (e) {
      logError("Failed to set up routing packet listener:", e);
    }

    const MeshDeviceWithRetry = {
      sendText: async (text: string, recipientId: Destination): Promise<void> => {
        const packetId = await meshDevice.sendText(text, recipientId, true);
        log(`Sent to ${recipientId}. Packet ID: ${packetId}`);
        testPacketId = packetId;
      },
    } as unknown as MeshDevice;

    log(`Connected to Meshtastic device at ${DEVICE_IP}`);
    return MeshDeviceWithRetry;
  } catch (err) {
    logError("Failed to connect to Meshtastic node:", err);
    // Recursive retry after 5 seconds
    return new Promise((resolve) => {
      setTimeout(() => resolve(initTransport(onMessage)), 5_000);
    });
  }
}
