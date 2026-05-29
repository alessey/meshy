import { useEffect, useState, useMemo } from "react";
import styles from "./App.module.css";
import MapCell from "./components/MapCell/MapCell";
import type { Location } from "../../src/types";
import type { Player } from "../../src/game/player";
import Header from "./components/Header/Header";
import Details from "./components/Details/Details";

export default function App() {
  const [worldMap, setWorldMap] = useState<Record<string, Location> | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [playerDetails, setPlayerDetails] = useState<Player | null>(null);

  // Load Map once
  useEffect(() => {
    fetch("/api/map")
      .then((res) => res.json())
      .then(setWorldMap);
  }, []);

  // Poll players list
  useEffect(() => {
    const tick = () =>
      fetch("/api/players")
        .then((res) => res.json())
        .then(setPlayers);
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);

  // Poll specific player details
  useEffect(() => {
    if (!selectedId) {
      setPlayerDetails(null);
      return;
    }
    const tick = () =>
      fetch(`/api/player/${selectedId}`)
        .then((res) => res.json())
        .then(setPlayerDetails);
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [selectedId]);

  const gridDims = useMemo(() => {
    if (!worldMap) {
      return { r: 0, c: 0 };
    }

    const coords = Object.keys(worldMap).filter((k) => k.includes("-"));
    if (coords.length === 0) {
      return { r: 0, c: 0 };
    }

    const r = Math.max(...coords.map((k) => parseInt(k.split("-")[0])));
    const c = Math.max(...coords.map((k) => parseInt(k.split("-")[1])));
    return { r: isFinite(r) ? r : 0, c: isFinite(c) ? c : 0 };
  }, [worldMap]);

  const selectedPlayerLocation = useMemo(() => {
    if (!selectedId) {
      return null;
    }

    return (players ?? []).find((p) => p.id === selectedId)?.location;
  }, [selectedId, players]);

  const roadPaths = useMemo(() => {
    if (!worldMap) {
      return [];
    }

    const paths: string[] = [];
    const seen = new Set<string>();
    const cellSize = 90; // match grid cell size

    Object.entries(worldMap).forEach(([coord, loc]) => {
      const [r1, c1] = coord.split("-").map(Number);

      // calculate center of start cell
      const startX = (c1 - 0.5) * cellSize;
      const startY = (r1 - 0.5) * cellSize;

      Object.values(loc.actions).forEach((targetCoord) => {
        if (!targetCoord || targetCoord === "EMPTY") {
          return;
        }

        const [r2, c2] = targetCoord.split("-").map(Number);

        // calculate center of target cell
        const endX = (c2 - 0.5) * cellSize;
        const endY = (r2 - 0.5) * cellSize;

        // prevent drawing the same road twice
        const roadId = [coord, targetCoord].sort().join("<->");
        if (!seen.has(roadId)) {
          seen.add(roadId);

          // create curvy bezier path
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          const bend = Math.random() * 25 + 15; // pixels to offset the curve
          const cx = c1 === c2 ? midX + bend : midX;
          const cy = r1 === r2 ? midY + bend : midY;

          paths.push(`M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`);
        }
      });
    });
    return paths;
  }, [worldMap]);

  return (
    <main className={styles.container}>
      <Header setSelectedId={setSelectedId} players={players} selectedId={selectedId} />

      <section className={styles.dashboardLayout}>
        <div className={styles.mapSection}>
          <div
            className={styles.mapContainer}
            style={{
              gridTemplateColumns: `repeat(${gridDims.c}, 90px)`,
              position: "relative",
            }}
          >
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 5,
              }}
              viewBox={`0 0 ${gridDims.c * 90} ${gridDims.r * 90}`}
            >
              {roadPaths.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="rgba(201, 125, 26, 0.89)" strokeWidth="4" />
              ))}
            </svg>

            {Array.from({ length: gridDims.r * gridDims.c }).map((_, index) => {
              const rowIndex = Math.floor(index / gridDims.c) + 1;
              const colIndex = (index % gridDims.c) + 1;
              const coord = `${rowIndex}-${colIndex}`;
              const cell = worldMap?.[coord];
              const occupants = players.filter((p) => p.location === coord);
              const isSelectedCell = selectedPlayerLocation === coord;

              return (
                <MapCell
                  key={coord}
                  cell={cell}
                  coord={coord}
                  playersHere={occupants}
                  selectedId={selectedId}
                  isSelectedCell={isSelectedCell}
                  isStart={cell?.isStart || false}
                />
              );
            })}
          </div>
        </div>

        <Details
          selectedId={selectedId}
          playerDetails={playerDetails}
          setSelectedId={setSelectedId}
        />
      </section>
    </main>
  );
}
