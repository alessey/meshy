import { USE_LOGGING } from "./config/constants.js";

export async function log(...args: unknown[]): Promise<void> {
  if (USE_LOGGING) {
    console.log(...args);
  }
}

export async function logError(...args: unknown[]): Promise<void> {
  if (USE_LOGGING) {
    console.error(...args);
  }
}
