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

if (!isMock) {
  client = mqtt.connect("mqtt://localhost:1883");

  client.on("connect", () => {
    log("Connected to MQTT broker");

    client.subscribe("msh/#", (err: any) => {
      if (!err) {
        log("Subscribed to mesh topics");
      }
    });
  });

  client.on("message", (topic: any, message: any) => {
    try {
      if (!game) return;
      console.log("Received MQTT message on topic:", topic);
      console.log("Raw message payload:", message.toString());
      const data = JSON.parse(message.toString());
      // Filter for text messages from the mesh
      if (data.type !== "text" || !data.payload?.text) {
        return;
      }

      log(`Message from ${data.sender}: ${data.payload.text}`);
      game.handleGameLogic(data.sender, data.payload.text);
    } catch (e) {
      logError("MQTT Parse error:", e);
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

        const topic = `msh/2/json/LongFast`;
        const payload = JSON.stringify({
          type: "sendtext",
          payload: text,
          dest: destination,
        });
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
