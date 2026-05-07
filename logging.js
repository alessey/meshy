import { USE_MOCK } from "./constants.js";

export async function log(...args) {
    if (USE_MOCK) {
        console.log(...args);
    }
}

export async function logError(...args) {
    if (USE_MOCK) {
        console.error(...args);
    }
}
