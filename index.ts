import path from "path";
import mqtt from "mqtt";
import express from "express";
import { Game } from "./src/app/Game.js";
import worldMap from "./src/world/map.js";
import { log, logError } from "./src/logging.js";
import { loadPlayerData } from "./src/storage/playerStore.js";
import type { Player } from "./src/game/player.js";

const isMock = process.env.USE_MOCK === "true";
let client: any = null;
let game: Game | null = null;
let playerStates: Map<string, Player> = new Map();
let lastGatewayId: string | null = null;

if (!isMock) {
  // If you add a username/password later, format it as:
  // mqtt://username:password@localhost:1883
  client = mqtt.connect("mqtt://localhost:1883", {
    keepalive: 60,
    reconnectPeriod: 1000,
  });

  client.on("connect", () => {
    log("Server script connected to local MQTT broker");

    // Subscribe to the root. Since your logs show msh/US, msh/# covers it.
    client.subscribe("msh/#", (err: any) => {
      if (!err) {
        log("Subscribed to Meshtastic topics (msh/#)");
      }
    });
  });

  client.on("reconnect", () => {
    log("Attempting to reconnect to MQTT broker...");
  });

  client.on("error", (err: any) => {
    logError("MQTT Client Error:", err);
  });

  client.on("offline", () => {
    log("MQTT Client went offline");
  });

  client.on("message", (topic: any, message: any) => {
    // Ignore binary/encrypted packets (topic contains '/e/') to prevent JSON parse errors
    if (!topic.includes("/json/")) return;

    try {
      const rawPayload = message.toString();
      log(`[TRAFFIC] Topic: ${topic} | Data: ${rawPayload.substring(0, 100)}...`);

      const data = JSON.parse(rawPayload);
      const sender = data.from || data.sender;
      const text = typeof data.payload === "string" ? data.payload : data.payload?.text;

      // Capture the gateway ID (data.sender) to use for the return path
      if (data.sender && data.sender.startsWith("!")) {
        lastGatewayId = data.sender;
      }

      if (!game || data.type !== "text" || !text || !sender) {
        if (sender && data.type && data.type !== "text")
          log(`[MQTT] Ignored ${data.type} from ${sender}`);
        return;
      }

      const senderId = sender.toString();
      log(`[GAME] Valid message from ${senderId}: ${text}`);
      game.handleGameLogic(senderId, text);
    } catch (e) {
      logError(`[PARSE ERROR] Failed to parse JSON on ${topic}:`, e);
    }
  });
}

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
        if (isMock) return 0;

        // LongFast is usually channel 0.
        // The destination for a reply should be the integer ID of the sender.
        const destId =
          typeof destination === "string"
            ? destination.startsWith("!")
              ? parseInt(destination.substring(1), 16)
              : parseInt(destination)
            : destination;

        // We try to use the last seen gateway ID in the topic.
        // If we haven't seen one yet, we fall back to the base channel topic.
        const gatewaySuffix = lastGatewayId ? `/${lastGatewayId}` : "";

        // Using the US region and LongFast channel as seen in your logs.
        // Topic format: msh/US/2/json/LongFast/!gatewayId
        const topic = `msh/US/2/json/LongFast${gatewaySuffix}`;

        const payload = JSON.stringify({
          type: "sendtext",
          payload: text,
          dest: destId,
        });
        log(`[MQTT] Publishing reply to ${topic} for ${destId}`);
        client?.publish(topic, payload);
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

    log(isMock ? "Simulator ready (Mock Mode)." : "Mesh Game System initialized via MQTT");
  } catch (error) {
    logError("Critical Failure:", error);
  }
}

start();
