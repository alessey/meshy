import { useEffect, useState, useMemo } from "react";

interface PlayerSummary {
  id: string;
  location: string;
  level: number;
}

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
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, [selectedId]);

  const gridDims = useMemo(() => {
    if (!worldMap) return { r: 0, c: 0 };
    const coords = Object.keys(worldMap).filter((k) => k.includes("-"));
    if (coords.length === 0) return { r: 0, c: 0 };
    const r = Math.max(...coords.map((k) => parseInt(k.split("-")[0])));
    const c = Math.max(...coords.map((k) => parseInt(k.split("-")[1])));
    return { r: isFinite(r) ? r : 0, c: isFinite(c) ? c : 0 };
  }, [worldMap]);

  const TileIcon = ({ type }: { type?: string }) => {
    if (!type) return null;
    return (
      <img
        src={`/tiles/${type}.svg`}
        className="cell-bg-icon"
        alt={type}
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
    );
  };

  const selectedPlayerLocation = useMemo(() => {
    if (!selectedId) return null;
    return players.find((p) => p.id === selectedId)?.location;
  }, [selectedId, players]);

  return (
    <div className="app-root">
      <header>
        <h1>Meshy Dashboard</h1>
        <div className="controls">
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">All Players / Overview</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                Node: {p.id} (Lvl {p.level})
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="dashboard-layout">
        <div className="map-section">
          <div
            className="map-container"
            style={{ gridTemplateColumns: `repeat(${gridDims.c}, 1fr)` }}
          >
            {Array.from({ length: gridDims.r * gridDims.c }).map((_, index) => {
              const rowIndex = Math.floor(index / gridDims.c) + 1;
              const colIndex = (index % gridDims.c) + 1;
              const coord = `${rowIndex}-${colIndex}`;
              const cell = worldMap?.[coord];
              const occupants = players.filter((p) => p.location === coord);
              const isSelectedCell = selectedPlayerLocation === coord;

              return (
                <div
                  key={coord}
                  className={`map-cell ${cell ? "active" : ""} ${isSelectedCell ? "selected" : ""}`}
                  style={cell?.isStart ? { background: "#0f273a" } : {}}
                >
                  {cell && (
                    <>
                      <TileIcon type={cell.cellType} />
                      <div className="cell-label">{coord}</div>
                      <div className="map-icons">
                        {(cell.monsterChance > 0 || cell.monsterPool?.length > 0) && (
                          <span title="Monster">👾</span>
                        )}
                        {(cell.itemChance > 0 || cell.itemPool?.length > 0) && (
                          <span title="Item">⚔️</span>
                        )}
                        {cell.potionChance > 0 && <span title="Potion">🧪</span>}
                      </div>
                      <div className="marker-tray">
                        {occupants.map((p) => (
                          <div
                            key={p.id}
                            className={`player-marker ${p.id === selectedId ? "active-player" : ""}`}
                            title={`Player ${p.id}`}
                          >
                            {p.id.toString().slice(0, 2)}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedId && playerDetails && (
          <div className="details-section">
            <div className="player-card">
              <div className="stat-grid">
                <StatBox label="Location" value={playerDetails.location} />
                <StatBox label="Health" value={`${playerDetails.hp} / ${playerDetails.maxHp}`} />
                <StatBox label="Level" value={`${playerDetails.level} (${playerDetails.xp} XP)`} />
                <StatBox label="Attack" value={playerDetails.attack} />
              </div>

              <div className="equip-section">
                <div className="section">
                  <h3>Equipment</h3>
                  <p>
                    Weapon: <strong>{playerDetails.weapon.name}</strong>
                  </p>
                  <p>
                    Armor: <strong>{playerDetails.armor.name}</strong>
                  </p>
                </div>
                <div className="section">
                  <h3>Bag</h3>
                  <ul>
                    {playerDetails.items.map((item: any, i: number) => (
                      <li key={i}>
                        {item.name} ({item.type || "Item"})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {playerDetails.encounter && (
                <div className="encounter-banner">
                  <h3>Active Encounter: {playerDetails.encounter.type.toUpperCase()}</h3>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-item">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
