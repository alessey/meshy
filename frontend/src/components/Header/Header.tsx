import styles from "./Header.module.css";
import type { PlayerSummary } from "../../types";

type HeaderProps = {
  setSelectedId: (id: string) => void;
  players: PlayerSummary[];
  selectedId: string;
};

export default function Header({ setSelectedId, players, selectedId }: HeaderProps) {
  return (
    <header className={styles.container}>
      <h1>The World</h1>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className={styles.item}
      >
        <option value="">All Players / Overview</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            Node: {p.id} (Lvl {p.level})
          </option>
        ))}
      </select>
    </header>
  );
}
