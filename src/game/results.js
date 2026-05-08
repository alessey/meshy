export function gameMessage(text, actions = []) {
  return { type: "game", text, actions };
}

export function plainMessage(text) {
  return { type: "plain", text };
}

export function result(messages = [], options = {}) {
  return {
    messages,
    shouldSave: options.shouldSave ?? false,
  };
}
