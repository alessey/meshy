import path from "path";
import { MeshDevice } from "@meshtastic/core";
import { TransportNodeSerial } from "@meshtastic/transport-node-serial";
import { SERIAL_PORT } from "./src/config/constants.js";
import express from "express";
import { Game } from "./src/app/Game.js";
import worldMap from "./src/world/map.js";
import { log, logError } from "./src/logging.js";
import { loadPlayerData } from "./src/storage/playerStore.js";
import { MockTransport } from "./src/transport/mockTransport.js";
import type { Player } from "./src/game/player.js";

// Derive mode from environment variables
const isMock = process.env.USE_MOCK === "true";

if (!isMock) {
  log(`Initializing Hardware Mode on port: ${SERIAL_PORT}`);
  if (process.platform === "darwin" && SERIAL_PORT.startsWith("/dev/ttyUSB")) {
    log("Warning: You appear to be on macOS using a Linux-style serial path (/dev/ttyUSB).");
    log("Check 'ls /dev/cu.*' to find your actual device path.");
  }
}

// initialize
let transport: any;
try {
  transport = isMock ? new MockTransport() : new TransportNodeSerial(SERIAL_PORT as any);
} catch (e) {
  logError(
    "Failed to initialize Transport. Ensure SERIAL_PORT is correct and Node.js version is stable.",
    e,
  );
  process.exit(1);
}

const device = new MeshDevice(transport);

// Web server setup
const app = express();
const WEB_PORT = process.env.WEB_PORT ?? 3000;
let playerStates: Map<string, Player> = new Map();

// --- WEB SERVER SETUP ---
app.use(express.json());
// Use an absolute path to the public directory to ensure it works regardless of where node is called from
const distPath = path.resolve(process.cwd(), "frontend", "dist");
app.use(express.static(distPath));

// API to get all player IDs
app.get("/api/players", (req, res) => {
  const players = Array.from(playerStates).map(([id, p]) => ({
    id,
    location: p.location,
    level: p.level,
  }));
  res.json(players);
});

// API to get the world map structure
app.get("/api/map", (req, res) => {
  res.json(worldMap);
});

// API to get a specific player's stats
app.get("/api/player/:id", (req, res) => {
  const playerId = req.params.id;
  const player = playerStates.get(playerId);
  if (player) {
    // Convert Player class instance to a plain object for JSON serialization
    res.json({
      location: player.location,
      hp: player.hp,
      maxHp: player.maxHp,
      attack: player.attack,
      level: player.level,
      xp: player.xp,
      weapon: player.weapon,
      armor: player.armor,
      items: player.items,
      encounter: player.encounter,
    });
  } else {
    res.status(404).send("Player not found");
  }
});

// Start the web server immediately so the dashboard is available during hardware boot
app.listen(WEB_PORT, () => {
  log(`Web dashboard available at http://localhost:${WEB_PORT}`);
});

// --- BOOT ---
async function start(): Promise<void> {
  try {
    playerStates = await loadPlayerData();
    const game = new Game(device as any, playerStates);

    if (isMock) {
      process.stdin.on("data", (data: any) => {
        game.handleGameLogic("MOCK_USER", data);
      });
    }

    // connect the hardware/transport
    await transport.connect();

    // hardware Listener
    if (!isMock) {
      device.events.onMessagePacket.subscribe((packet: any) => {
        // don't respond to our own messages
        const myNodeNum = (device as any).myNodeInfo?.myNodeNum;
        if (packet.from !== myNodeNum) {
          game.handleGameLogic(packet.from, packet.data);
        }
      });
    }

    // start the internal packet processing loop
    await device.configure();

    log(isMock ? "Simulator ready." : `Mesh Connected: ${SERIAL_PORT}`);
  } catch (error) {
    logError("Critical Failure:", error);
  }
}

start();
