import { useEffect, useState, useMemo } from "react";
import styles from "./App.module.css";
import StatBox from "./components/StatBox/StatBox";
import MapCell from "./components/MapCell/MapCell";
import type { PlayerSummary } from "./types";
import Header from "./components/Header/Header";

export default function App() {
  const [worldMap, setWorldMap] = useState<any>(null);
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [playerDetails, setPlayerDetails] = useState<any>(null);

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

  return (
    <main className={styles.container}>
      <Header setSelectedId={setSelectedId} players={players} selectedId={selectedId} />

      <section className={styles.dashboardLayout}>
        <div className={styles.mapSection}>
          <div
            className={styles.mapContainer}
            style={{ gridTemplateColumns: `repeat(${gridDims.c}, 90px)` }}
          >
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

        {selectedId && playerDetails && (
          <article className={styles.detailsSection}>
            <div className="grid">
              <StatBox label="Location" value={playerDetails.location} />
              <StatBox label="Health" value={`${playerDetails.hp} / ${playerDetails.maxHp}`} />
              <StatBox label="Level" value={`${playerDetails.level} (${playerDetails.xp} XP)`} />
              <StatBox label="Attack" value={playerDetails.attack} />
            </div>

            <div className={styles.equipSection}>
              <section className={styles.section}>
                <h4 style={{ color: "var(--pico-primary)" }}>Equipment</h4>
                <p>
                  Weapon: <strong>{playerDetails.weapon.name}</strong>
                </p>
                <p>
                  Armor: <strong>{playerDetails.armor.name}</strong>
                </p>
              </section>
              <section className={styles.section}>
                <h4 style={{ color: "var(--pico-primary)" }}>Bag</h4>
                <ul>
                  {playerDetails.items.map((item: any, i: number) => (
                    <li key={i}>
                      {item.name} ({item.type || "Item"})
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {playerDetails.encounter && (
              <footer className={styles.encounterBanner}>
                <strong>Active Encounter: {playerDetails.encounter.type.toUpperCase()}</strong>
              </footer>
            )}
          </article>
        )}
      </section>
    </main>
  );
}
