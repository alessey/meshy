import type { MeshDevice } from "@meshtastic/core";
import type { Player } from "./src/game/player.js";
import type { Destination } from "./src/network/types.js";
import { Game } from "./src/app/Game.js";
import { log, logError } from "./src/logging.js";
import { loadPlayerData } from "./src/storage/playerStore.js";
import { startWebServer } from "./src/web/server.js";
import { DEVICE_IP, USE_MOCK } from "./src/config/constants.js";
import { dispatchMessages } from "./src/app/messageDispatcher.js";
import { MeshClient } from "./src/network/meshClient.js";

let meshDevice: MeshDevice | null = null;
let game: Game | null = null;
const playerStates: Map<string, Player> = new Map();

async function start(): Promise<void> {
  try {
    log("Initializing Meshy...");

    // Load existing player data into our state map
    const loadedData = await loadPlayerData();
    loadedData.forEach((value, key) => playerStates.set(key, value));

    game = new Game(playerStates);

    if (!USE_MOCK) {
      if (!DEVICE_IP) {
        throw new Error("DEVICE_IP is not defined in environment variables.");
      }

      const meshClient = new MeshClient(DEVICE_IP, async (senderId, text) => {
        log(`Message received from ${senderId}: ${text}`);

        if (game && meshDevice) {
          const messages = game.handleGameLogic(senderId as Destination, text);
          const player = game.getPlayer(senderId);
          await dispatchMessages(meshDevice, senderId as Destination, player, messages);
        }
      });

      meshClient.connect();
    }

    startWebServer(playerStates);

    if (USE_MOCK) {
      log("Mock mode enabled. Type commands in terminal (e.g. /play)");
      process.stdin.on("data", async (data) => {
        const input = data.toString().trim();
        if (input && game) {
          const messages = game.handleGameLogic("MOCK_USER" as Destination, input);
          const player = game.getPlayer("MOCK_USER");

          await dispatchMessages(
            meshDevice as MeshDevice,
            "MOCK_USER" as Destination,
            player,
            messages,
          );
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
