import { useEffect, useState, useMemo } from "react";
import styles from "./App.module.css";
import MapCell from "./components/MapCell/MapCell";
import type { Location } from "../../src/types";
import type { Player } from "../../src/game/player";
import Header from "./components/Header/Header";
import Details from "./components/Details/Details";
import Roads from "./components/Roads/Roads";

export default function App() {
  const [worldMap, setWorldMap] = useState<Record<string, Location> | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [playerDetails, setPlayerDetails] = useState<Player | null>(null);

  // load Map
  useEffect(() => {
    fetch("/api/map")
      .then((res) => res.json())
      .then(setWorldMap);
  }, []);

  // poll players list
  useEffect(() => {
    const tick = () =>
      fetch("/api/players")
        .then((res) => res.json())
        .then(setPlayers);
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);

  // poll specific player details
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
            <Roads worldMap={worldMap} gridDims={gridDims} />

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
