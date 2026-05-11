import { USE_LOGGING } from "./config/constants.js";

export function log(...args: unknown[]): void {
  if (USE_LOGGING) {
    console.log("[MESHY]", ...args);
  }
}

export function logError(...args: unknown[]): void {
  if (USE_LOGGING) {
    console.error("[MESHY]", ...args);
  }
}
