import fs from 'fs/promises';
import { log, logError } from "./logging.js";
import { DB_PATH, SAVE_DEBOUNCE_MS } from "./constants.js";
import { hydratePlayer } from "./src/game/player.js";

const SAVE_BATCH_SIZE = 5;
let pendingSaveCount = 0;
let flushTimer = null;
let pendingPromise = null;
let pendingResolve = null;
let pendingReject = null;

export async function loadPlayerData() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const savedPlayers = Object.entries(JSON.parse(data));
    const playerStates = new Map(savedPlayers.map(([id, player]) => [id, hydratePlayer(player)]));
    log(`Loaded ${playerStates.size} players.`);
    return playerStates;
  } catch (err) {
    log("Starting fresh database.");
    return new Map();
  }
}

async function performSave(playerStates) {
  try {
    const data = JSON.stringify(Object.fromEntries(playerStates));
    await fs.writeFile(DB_PATH, data, 'utf-8');
    log("Disk Sync: Player states saved.");
  } catch (err) {
    logError("Save Error:", err);
    throw err;
  }
}

function flush(playerStates) {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (!pendingPromise) {
    pendingPromise = Promise.resolve();
    return pendingPromise;
  }

  const promise = pendingPromise;
  const resolve = pendingResolve;
  const reject = pendingReject;

  pendingPromise = null;
  pendingResolve = null;
  pendingReject = null;
  pendingSaveCount = 0;

  return performSave(playerStates).then(resolve, reject);
}

export function save(playerStates) {
  pendingSaveCount += 1;

  if (!pendingPromise) {
    pendingPromise = new Promise((resolve, reject) => {
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
