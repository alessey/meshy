import { USE_LOGGING } from "./config/constants.js";

export function log(...args: unknown[]): void {
  if (USE_LOGGING) {
    console.log(...args);
  }
}

export function logError(...args: unknown[]): void {
  if (USE_LOGGING) {
    console.error(...args);
  }
}
