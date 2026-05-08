import { MeshDevice } from "@meshtastic/core";
import { TransportNodeSerial } from "@meshtastic/transport-node-serial";
import { USE_MOCK, SERIAL_PORT } from "./src/config/constants.js";
import { Game } from "./src/app/Game.js";
import { log, logError } from "./src/logging.js";
import { loadPlayerData } from "./src/storage/playerStore.js";
import { MockTransport } from "./src/transport/mockTransport.js";
// initialize
const transport = USE_MOCK ? new MockTransport() : new TransportNodeSerial(SERIAL_PORT);
const device = new MeshDevice(transport);
let playerStates = new Map();
// --- BOOT ---
async function start() {
    try {
        playerStates = await loadPlayerData();
        const game = new Game(device, playerStates);
        if (USE_MOCK) {
            process.stdin.on("data", (data) => {
                game.handleGameLogic("MOCK_USER", data);
            });
        }
        // 1. Connect the hardware/transport
        await transport.connect();
        // 2. Hardware Listener (Using the new .events.onMessagePacket pattern)
        if (!USE_MOCK) {
            device.events.onMessagePacket.subscribe((packet) => {
                // Ensure we don't respond to our own automated messages
                const myNodeNum = device.myNodeInfo?.myNodeNum;
                if (packet.from !== myNodeNum) {
                    game.handleGameLogic(packet.from, packet.data);
                }
            });
        }
        // 3. CRITICAL: Start the internal packet processing loop
        await device.configure();
        log(USE_MOCK ? "Simulator ready." : `Mesh Connected: ${SERIAL_PORT}`);
    }
    catch (error) {
        logError("Critical Failure:", error);
    }
}
start();
