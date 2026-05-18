# 📡 Meshy: Meshtastic Node RPG Engine

Meshy is a full-stack, text-based RPG engine built specifically for the [Meshtastic](https://meshtastic.org/) LoRa network. It transforms a Meshtastic node into a game server, allowing anyone on the mesh to participate in a persistent adventure using only their LoRa devices.

The project consists of a **Node.js backend** that manages the game state and Meshtastic hardware interface, and a **React-based dashboard** for real-time world monitoring and administration.

## 🌟 Key Features

*   **Mesh-Native Interaction**: Players join and play entirely through Meshtastic text messages. No internet required.
*   **Persistent World State**: Player progress, inventory, and locations are saved automatically to a flat-file JSON database.
*   **Visual Admin Dashboard**: A Vite + React frontend provides a bird's-eye view of the game map, player locations, and detailed statistics.
*   **Dynamic Pathing**: The engine supports a grid-based movement system with defined connections (roads) between locations.
*   **Hardware Agnostic**: Supports physical Meshtastic nodes via TCP/IP or a "Mock Mode" for rapid local development.
*   **Bandwidth Optimized**: Built-in character limits and save debouncing to respect the low-bandwidth nature of LoRa.

## 🏗 Architecture

### Backend (`/src`)
The core engine manages the bridge between the physical Mesh and the game logic.
*   **Game Logic**: Handles encounters, combat, and inventory management.
*   **World Engine**: Manages the coordinate-based map and valid player transitions.
*   **API**: Serves endpoints for the frontend to consume player and map data.

### Frontend (`/frontend`)
A modern React application built with:
*   **Vite**: For fast development and optimized builds.
*   **Pico.css**: For a lightweight, semantic UI.
*   **SVG Map**: Dynamically renders the world grid and player paths using Bezier curves.

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Runtime** | Node.js (v18+) |
| **Language** | TypeScript |
| **Frontend** | React, Vite, Pico.css |
| **Hardware** | `@meshtastic/transport-node`, `@meshtastic/core` |
| **Linting** | oxlint, oxfmt |
| **Package Manager** | pnpm |

## 📦 Getting Started

### 1. Prerequisites
*   A Meshtastic node configured for network access (or use `USE_MOCK=true`).
*   `pnpm` installed on your machine.

### 2. Installation
```bash
pnpm install
```

### 3. Configuration
Create a `.env` file in the root directory:

```bash
# System Config
USE_LOGGING=true        # Enable verbose console logs
USE_MOCK=false           # Set to true to run without a physical node
DB_PATH="./players.json" # Where player data is stored

# Meshtastic Settings
DEVICE_IP="192.168.1.x"  # IP of your Meshtastic node
CHAR_LIMIT=200           # Max length of outgoing mesh messages
SAVE_DEBOUNCE_MS=3000    # Frequency of disk writes for state
```

```bash
pnpm install
```

```bash
pnpm start:dev
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
