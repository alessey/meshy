Meshtastic node RPG

- nodejs
- @meshtastic/core
- @meshtastic/transport-node
- express
- react
- vite
- oxlint/oxfmt
- picocss

.env file
```bash
USE_LOGGING = true;
USE_MOCK = false;
DB_PATH = "./players.json";
CHAR_LIMIT = 220;
SAVE_DEBOUNCE_MS = 3000;
DEVICE_IP = "192.168.1.x";
```

```bash
pnpm install
```

```bash
pnpm start-dev
```

```bash
pnpm start
```

To start game

```bash
/play
```

To interact

```bash
/{command}
```

In dev mode (with hotreloading)
http://localhost:5173/

In prod mode
http://localhost:3000
