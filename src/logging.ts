import { USE_LOGGING } from "./config/constants.js";

function getTimestamp(): string {
  const now = new Date();
  return now.toTimeString().split(" ")[0] + ":" + now.getMilliseconds().toString().padStart(3, "0");
}

export function log(...args: unknown[]): void {
  if (USE_LOGGING) {
    console.log(`${getTimestamp()}\tINFO\t[MESHY]`, ...args);
  }
}

export function logError(...args: unknown[]): void {
  if (USE_LOGGING) {
    console.error(`${getTimestamp()}\tERROR\t[MESHY]`, ...args);
  }
}
