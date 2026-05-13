import { USE_LOGGING } from "./config/constants.js";

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";

function getTimestamp(): string {
  const now = new Date();
  return now.toTimeString().split(" ")[0] + ":" + now.getMilliseconds().toString().padStart(3, "0");
}

export function log(...args: unknown[]): void {
  if (USE_LOGGING) {
    console.log(`${getTimestamp()}\t${GREEN}INFO${RESET}\t${CYAN}[MESHY]${RESET}\t\t`, ...args);
  }
}

export function logError(...args: unknown[]): void {
  if (USE_LOGGING) {
    console.error(`${getTimestamp()}\t${RED}ERROR${RESET}\t${CYAN}[MESHY]${RESET}\t\t`, ...args);
  }
}
