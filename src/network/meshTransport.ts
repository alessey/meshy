import { TransportNode } from "@meshtastic/transport-node";
import { type Protobuf, MeshDevice } from "@meshtastic/core";
import { log, logError } from "../logging.js";
import { DEVICE_IP } from "../config/constants.js";

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

    const transport = await TransportNode.create(DEVICE_IP);
    const meshDevice = new MeshDevice(transport);
    await meshDevice.configure();

    meshDevice.events.onMessagePacket.subscribe(async (packet: Protobuf.Mesh.IMeshPacket) => {
      if (!packet.data || !packet.data.startsWith("/")) {
        return;
      }

      const senderId = packet.from.toString();
      const text = packet.data;
      log(`[MESH] Received from ${senderId}: ${text}`);

      onMessage(senderId, text);
    });

    log(`Connected to Meshtastic device at ${DEVICE_IP}`);
    return meshDevice;
  } catch (err) {
    logError("Failed to connect to Meshtastic node:", err);
    // Recursive retry after 5 seconds
    return new Promise((resolve) => {
      setTimeout(() => resolve(initTransport(onMessage)), 5_000);
    });
  }
}
