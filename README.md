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
# turn on logging
USE_LOGGING=true

# mock mode for local testing
USE_MOCK=false 

# path to player database
DB_PATH="./players.json" 

# meshtastic character limit
CHAR_LIMIT=220 

# debounce time for saving player data
SAVE_DEBOUNCE_MS=3000 

# IP address of the Meshtastic node
DEVICE_IP="192.168.1.x" 
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
