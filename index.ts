import type { MeshDevice } from "@meshtastic/core";
import type { Player } from "./src/game/player.js";
import type { Destination } from "./src/network/types.js";
import { Game } from "./src/app/Game.js";
import { log, logError } from "./src/logging.js";
import { loadPlayerData } from "./src/storage/playerStore.js";
import { initTransport } from "./src/network/meshTransport.js";
import { startWebServer } from "./src/web/server.js";
import { USE_LOGGING, USE_MOCK } from "./src/config/constants.js";

let meshDevice: MeshDevice | null = null;
let game: Game | null = null;
const playerStates: Map<string, Player> = new Map();

async function start(): Promise<void> {
  try {
    // Load existing player data into our state map
    const loadedData = await loadPlayerData();
    loadedData.forEach((value, key) => playerStates.set(key, value));

    if (!USE_MOCK) {
      meshDevice = await initTransport((senderId, text) => {
        if (USE_LOGGING) {
          log(`Message received from ${senderId}: ${text}`);
        }

        if (game) {
          game.handleGameLogic(senderId as Destination, text);
        }
      });
    }

    if (!meshDevice) {
      throw new Error("Failed to initialize mesh device.");
    }

    game = new Game(meshDevice, playerStates);

    startWebServer(playerStates);

    if (USE_MOCK) {
      log("Mock mode enabled. Type commands in terminal (e.g. /play)");
      process.stdin.on("data", (data) => {
        const input = data.toString().trim();
        if (input && game) {
          game.handleGameLogic("MOCK_USER" as Destination, input);
        }
      });
    }

    log(
      USE_MOCK
        ? "Simulator ready (Mock Mode)."
        : "Mesh Game System initialized via HTTP/WS Transport",
    );
  } catch (error) {
    logError("Critical Failure:", error);
  }
}

start();
