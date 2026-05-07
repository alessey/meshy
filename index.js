import { MeshDevice } from "@meshtastic/core";
import { TransportNodeSerial } from "@meshtastic/transport-node-serial";
import { EventEmitter } from "events";
import { log, logError } from "./logging.js";
import { USE_MOCK, SERIAL_PORT } from "./constants.js";
import { loadPlayerData } from "./data.js";
import { Game } from "./game.js";

// --- MOCK TRANSPORT ---
class MockTransport extends EventEmitter {
    constructor() {
        super();
        this.fromDevice = new ReadableStream({ start() {} });
        this.toDevice = new WritableStream({ write() {} });
    }
    async connect() { 
        log("--- SIMULATOR ONLINE ---"); 
    }
}

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
                if (packet.from !== device.myNodeInfo?.myNodeNum) {
                    game.handleGameLogic(packet.from, packet.data);
                }
            });
        }

        // 3. CRITICAL: Start the internal packet processing loop
        await device.configure();
        
        log(USE_MOCK ? "Simulator ready." : `Mesh Connected: ${SERIAL_PORT}`);

    } catch (error) {
        logError("Critical Failure:", error);
    }
}

start();