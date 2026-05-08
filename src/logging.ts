import { USE_MOCK } from "./config/constants.js";

export async function log(...args: unknown[]): Promise<void> {
    if (USE_MOCK) {
        console.log(...args);
    }
}

export async function logError(...args: unknown[]): Promise<void> {
    if (USE_MOCK) {
        console.error(...args);
    }
}
