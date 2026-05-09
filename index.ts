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
let lastChannelName: string | null = null;
let lastChannelIndex: number = 0;

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
      const data = JSON.parse(rawPayload);
      log(`[TRAFFIC] Topic: ${topic} | Data: ${rawPayload}`);

      // Extract Gateway ID and Channel Name from the topic path
      // Documentation: msh/<region>/2/json/<channel>/<gateway_id>
      const topicParts = topic.split("/");
      const gatewayIndex = topicParts.findIndex((part: string) => part.startsWith("!"));

      if (gatewayIndex !== -1) {
        lastGatewayId = topicParts[gatewayIndex];
        // The channel name (e.g., 'PKI' or 'LongFast') is the segment before the gateway ID
        const channelCandidate = topicParts[gatewayIndex - 1];
        if (channelCandidate && channelCandidate !== "json") {
          lastChannelName = channelCandidate;
        }
      }
      lastChannelIndex = data.channel ?? 0;

      const sender = data.from || data.sender;
      const text = typeof data.payload === "string" ? data.payload : data.payload?.text;

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
        log(`[DEBUG] Bridge: sendText triggered to ${destination}`);
        if (isMock) return 0;

        // The destination for a reply should be the hex ID string (e.g. !d1be3043)
        const destId =
          typeof destination === "number"
            ? `!${destination.toString(16)}`
            : destination.startsWith("!")
              ? destination
              : `!${Number(destination).toString(16)}`;

        /**
         * Based on Meshtastic docs, the topic for sending via a gateway is:
         * msh/<region>/2/json/<channel>/<gateway_id>/in
         * When the gateway is configured to include channel names in topics,
         * it expects the downlink on the channel-specific path.
         */
        const channel = lastChannelName || "LongFast";
        const topic = lastGatewayId
          ? `msh/US/2/json/${channel}/${lastGatewayId}/in`
          : `msh/US/2/json/${channel}/in`;

        if (!client) {
          logError("MQTT client not initialized, cannot send text", new Error("No Client"));
          return 1;
        }

        const payload = JSON.stringify({
          type: "sendtext",
          dest: destId,
          text: text,
          channel: lastChannelIndex,
        });

        log(
          `[DEBUG] Bridge: Publishing to ${topic} | Dest: ${destId} | Channel: ${lastChannelIndex} | Text: ${text}`,
        );
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
