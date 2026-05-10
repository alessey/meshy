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

interface MessageContext {
  gatewayId: string;
  channelName: string;
  channelIndex: number;
  fullTopic: string;
}
const playerContexts: Map<string, MessageContext> = new Map();

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

      const sender = data.from || data.sender;
      if (!sender) return;

      // Normalize senderId to a decimal string for consistent Map lookup.
      // Incoming 'from' is often a number, 'sender' is often a hex string like '!02eca9ec'.
      const senderId =
        typeof sender === "string" && (sender.startsWith("!") || /^[0-9a-fA-F]+$/.test(sender))
          ? parseInt(sender.startsWith("!") ? sender.substring(1) : sender, 16).toString()
          : sender.toString();

      // Extract Gateway ID and Channel Name from the topic path
      const topicParts = topic.split("/");
      const gatewayIndex = topicParts.findIndex((part: string) => part.startsWith("!"));

      if (gatewayIndex !== -1) {
        const gatewayId = topicParts[gatewayIndex];
        const channelName =
          topicParts[gatewayIndex - 1] !== "json" ? topicParts[gatewayIndex - 1] : "0";

        playerContexts.set(senderId, {
          gatewayId,
          channelName,
          channelIndex: data.channel ?? 0,
          fullTopic: topic,
        });
      }

      // Extract text safely from various possible JSON structures
      const text =
        typeof data.payload === "string" ? data.payload : (data.payload?.text ?? data.text);

      if (!game || data.type !== "text" || !text || !sender) {
        if (sender && data.type && data.type !== "text")
          log(`[MQTT] Ignored ${data.type} from ${sender}`);
        return;
      }

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

        // The MQTT JSON API expects a numeric ID for the 'dest' field.
        const numericDest =
          typeof destination === "string"
            ? destination.startsWith("!")
              ? parseInt(destination.substring(1), 16)
              : parseInt(destination, 10)
            : destination;

        // Look up the specific context for this player, fallback to primary channel '0'
        const context = playerContexts.get(numericDest.toString());
        const channel = context?.channelName || "0";
        const gatewayId = context?.gatewayId;
        const channelIndex = context?.channelIndex ?? 0;

        /**
         * MQTT.cpp and the JSON API require a 'downlink' topic to process commands.
         * Publishing to the uplink topic (fullTopic) will be ignored by the gateway.
         * Standard format: msh/<region>/2/json/<channel>/<gatewayId>/in
         */
        const topic = gatewayId
          ? `msh/US/2/json/${channel}/${gatewayId}`
          : `msh/US/2/json/${channel}`;

        if (!client) {
          logError("MQTT client not initialized, cannot send text", new Error("No Client"));
          return 1;
        }

        // Reference: https://meshtastic.org/docs/software/integrations/mqtt/#json-downlink-to-instruct-a-node-to-send-a-message
        const payload = JSON.stringify({
          type: "sendtext",
          to: numericDest,
          channel: channelIndex,
          text,
        });

        log(
          `[DEBUG] Bridge: Publishing to ${topic} | Dest: ${numericDest} | Channel: ${channelIndex} | Text: ${text}`,
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
