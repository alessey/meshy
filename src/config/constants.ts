const toBool = (val: string | undefined): boolean => {
  if (!val) {
    return false;
  }

  return val.trim().toLowerCase() === "true";
};

export const USE_LOGGING = toBool(process.env.USE_LOGGING);
export const USE_MOCK = toBool(process.env.USE_MOCK);
export const DB_PATH = process.env.DB_PATH || "./players.json";
export const CHAR_LIMIT = parseInt(process.env.CHAR_LIMIT ?? "220");
export const SAVE_DEBOUNCE_MS = parseInt(process.env.SAVE_DEBOUNCE_MS ?? "3000");
export const DEVICE_IP = process.env.DEVICE_IP;
