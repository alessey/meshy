import type { Player } from "./src/game/player.js";
import type { Destination, MeshMessageContext } from "./src/network/types.js";
import { Game } from "./src/app/Game.js";
import { log, logError } from "./src/logging.js";
import { loadPlayerData } from "./src/storage/playerStore.js";
import { startWebServer } from "./src/webserver/server.js";
import { DEVICE_IP, USE_MOCK } from "./src/config/constants.js";
import { MeshClient } from "./src/network/meshClient.js";

let game: Game | null = null;
const playerStates: Map<string, Player> = new Map();

async function start(): Promise<void> {
  try {
    log("Initializing Meshy...");

    // Load existing player data into our state map
    const loadedData = await loadPlayerData();
    loadedData.forEach((value, key) => playerStates.set(key, value));

    game = new Game(playerStates);

    const handleIncomingMessage = async (ctx: MeshMessageContext) => {
      log(`Message received from ${ctx.senderId}: ${ctx.text}`);

      if (game) {
        const messages = game.handleGameLogic(ctx.senderId, ctx.text);
        await ctx.reply(messages);
      }
    };

    if (!USE_MOCK) {
      if (!DEVICE_IP) {
        throw new Error("DEVICE_IP is not defined in environment variables.");
      }

      const meshClient = new MeshClient(DEVICE_IP, handleIncomingMessage);

      meshClient.connect();
    } else {
      log("Mock mode enabled. Type commands in terminal (e.g. /play)");
      process.stdin.on("data", async (data) => {
        const text = data.toString().trim();
        if (!text || !game) {
          return;
        }

        const mockCtx: MeshMessageContext = {
          senderId: "MOCK_USER" as Destination,
          text,
          reply: async (messages) => {
            messages.forEach((msg) => {
              log(msg.text);
            });
          },
        };

        await handleIncomingMessage(mockCtx);
      });
    }

    startWebServer(playerStates);

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
