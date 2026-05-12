import fs from "fs/promises";
import { log, logError } from "../logging.js";
import { DB_PATH, SAVE_DEBOUNCE_MS } from "../config/constants.js";
import { hydratePlayer } from "../game/player.js";
import type { Player } from "../game/player.js";

const SAVE_BATCH_SIZE = 5;
let pendingSaveCount = 0;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPromise: Promise<void> | null = null;
let pendingResolve: (() => void) | null = null;
let pendingReject: ((err: unknown) => void) | null = null;

export async function loadPlayerData(): Promise<Map<string, Player>> {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    const savedPlayers = Object.entries(JSON.parse(data)) as [string, Player][];
    const playerStates = new Map(savedPlayers.map(([id, player]) => [id, hydratePlayer(player)]));
    log(`Loaded ${playerStates.size} players.`);
    return playerStates;
  } catch {
    log("DB Not found, starting fresh database.");
    return new Map();
  }
}

async function performSave(playerStates: Map<string, Player>): Promise<void> {
  try {
    const data = JSON.stringify(Object.fromEntries(playerStates));
    await fs.writeFile(DB_PATH, data, "utf-8");
  } catch (err) {
    logError("Save Error:", err);
    throw err;
  }
}

function flush(playerStates: Map<string, Player>): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (!pendingPromise) {
    pendingPromise = Promise.resolve();
    return pendingPromise;
  }

  const resolve = pendingResolve!;
  const reject = pendingReject!;

  pendingPromise = null;
  pendingResolve = null;
  pendingReject = null;
  pendingSaveCount = 0;

  return performSave(playerStates).then(resolve, reject);
}

export function save(playerStates: Map<string, Player>): Promise<void> {
  pendingSaveCount += 1;

  if (!pendingPromise) {
    pendingPromise = new Promise<void>((resolve, reject) => {
      pendingResolve = resolve;
      pendingReject = reject;
    });
  }

  if (pendingSaveCount >= SAVE_BATCH_SIZE) {
    return flush(playerStates);
  }

  if (!flushTimer) {
    flushTimer = setTimeout(() => flush(playerStates), SAVE_DEBOUNCE_MS);
  }

  return pendingPromise;
}
