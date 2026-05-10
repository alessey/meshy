import path from "path";
import express from "express";
import { log } from "../logging.js";
import worldMap from "../world/map.js";
import type { Player } from "../game/player.js";

export function startWebServer(playerStates: Map<string, Player>) {
  const app = express();
  const WEB_PORT = process.env.WEB_PORT ?? 3000;

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

  return app;
}
