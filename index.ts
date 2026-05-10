import path from "path";
import express from "express";
import { TransportNode } from "@meshtastic/transport-node";
import { Protobuf, MeshDevice } from "@meshtastic/core";
import { Game } from "./src/app/Game.js";
import worldMap from "./src/world/map.js";
import { log, logError } from "./src/logging.js";
import { DEVICE_IP } from "./src/config/constants.js";
import { loadPlayerData } from "./src/storage/playerStore.js";
import type { Player } from "./src/game/player.js";

const isMock = process.env.USE_MOCK === "true";
let meshDevice: MeshDevice | null = null;
let game: Game | null = null;
let playerStates: Map<string, Player> = new Map();

async function initTransport() {
  try {
    const transport = await TransportNode.create(DEVICE_IP);
    meshDevice = new MeshDevice(transport);
    await meshDevice.configure();

    meshDevice.events.onMessagePacket.subscribe(async (meshPacket: Protobuf.Mesh.MeshPacket) => {
      console.log("aaaaaa meshpacket", meshPacket);
      // await meshDevice.sendText(response, messagePacket.from, true, messagePacket.channel)
    });

    // Use the native RxJS Observables provided by MeshDevice
    // ts-ignore because the library's types don't reflect the actual observables available
    meshDevice.handleMeshPacket((meshPacket: Protobuf.Mesh.MeshPacket) => {
      if (!meshPacket) {
        return;
      }
      console.log("meshpacket", meshPacket);

      // const senderId = packet.from.toString();
      // const text = new TextDecoder().decode(packet.decoded.payload);

      // log(`[MESH] Received from ${senderId}: ${text}`);
      // if (game) {
      //   game.handleGameLogic(senderId, text);
      // }
    });

    log(`Connected to Meshtastic device at ${DEVICE_IP}`);
  } catch (err) {
    logError("Failed to connect to Meshtastic node:", err);
    // Retry logic
    setTimeout(initTransport, 5000);
  }
}

if (!isMock) initTransport();

// Web server setup
const app = express();
const WEB_PORT = process.env.WEB_PORT ?? 3000;

// --- WEB SERVER SETUP ---
app.use(express.json());
const distPath = path.resolve(process.cwd(), "frontend", "dist");
app.use(express.static(distPath));

app.get("/api/players", (req, res) => {
  const players = Array.from(playerStates).map(([id, p]) => ({
    id,
    location: p.location,
    level: p.level,
  }));
  res.json(players);
});

app.get("/api/map", (req, res) => {
  res.json(worldMap);
});

app.get("/api/player/:id", (req, res) => {
  const playerId = req.params.id;
  const player = playerStates.get(playerId);
  if (player) {
    res.json(player);
  } else {
    res.status(404).send("Player not found");
  }
});

app.listen(WEB_PORT, () => {
  log(`Web dashboard available at http://localhost:${WEB_PORT}`);
});

// --- BOOT ---
async function start(): Promise<void> {
  try {
    // Load existing player data into our state map
    const loadedData = await loadPlayerData();
    loadedData.forEach((value, key) => playerStates.set(key, value));

    /**
     * This bridge mimics the Meshtastic device interface that the Game class expects.
     * When the Game calls 'device.sendText', we translate that into an MQTT publish
     * that the Meshtastic MQTT gateway understands.
     */
    const meshDeviceBridge = {
      sendText: async (text: string, destination: string | number) => {
        if (isMock || !meshDevice) {
          log(
            `[DEBUG] Bridge: Mock or Transport not ready. Target: ${destination} | Text: ${text}`,
          );
          return 0;
        }

        const numericDest =
          typeof destination === "string"
            ? destination.startsWith("!")
              ? parseInt(destination.substring(1), 16)
              : parseInt(destination, 10)
            : destination;

        // Use the high-level API provided by MeshDevice
        await meshDevice.sendText(text, numericDest);
        log(`[DEBUG] Bridge: Sent packet to ${numericDest}`);
        return 0;
      },
    };

    game = new Game(meshDeviceBridge as any, playerStates);

    if (isMock) {
      log("Mock mode enabled. Type commands in terminal (e.g. /play)");
      process.stdin.on("data", (data) => {
        const input = data.toString().trim();
        if (input && game) {
          game.handleGameLogic("MOCK_USER", input);
        }
      });
    }

    log(
      isMock
        ? "Simulator ready (Mock Mode)."
        : "Mesh Game System initialized via HTTP/WS Transport",
    );
  } catch (error) {
    logError("Critical Failure:", error);
  }
}

start();
