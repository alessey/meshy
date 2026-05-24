import styles from "./MapCell.module.css";
import TileIcon from "../TileIcon/TileIcon";
import type { Location } from "../../../../src/types";
import type { Player } from "../../../../src/game/player";

type MapCellProps = {
  cell: Location | undefined;
  coord: string;
  playersHere: Player[];
  selectedId: string;
  isSelectedCell: boolean;
  isStart: boolean;
};

export default function MapCell({
  cell,
  coord,
  playersHere,
  selectedId,
  isSelectedCell,
  isStart,
}: MapCellProps) {
  // Render an empty, non-active cell if no cell data exists for this coordinate
  if (!cell) {
    return <div key={coord} className={styles.mapCell}></div>;
  }

  return (
    <div
      key={coord}
      className={`${styles.mapCell} ${styles.active} ${isSelectedCell ? styles.selected : ""}`}
      style={isStart ? { background: "#0f273a" } : {}}
    >
      <TileIcon type={cell.cellType} />
      <div className={styles.cellLabel}>{coord}</div>
      <div className={styles.mapIcons}>
        {(cell.encounterChance ?? 0) > 0 &&
          (cell.encounterPool ?? []).map((encounter) => {
            if (encounter.type === "monster") {
              return (
                <span key={encounter.monster.name} title="Monster">
                  👾
                </span>
              );
            } else if (encounter.type === "item") {
              return (
                <span key={encounter.item.name} title="Item">
                  ⚔️
                </span>
              );
            } else if (encounter.type === "potion") {
              return (
                <span key={encounter.potion.name} title="Potion">
                  🧪
                </span>
              );
            }
            return null;
          })}
      </div>
      <div className={styles.markerTray}>
        {playersHere.map((p) => (
          <div
            key={p.id}
            className={`${styles.playerMarker} ${p.id === selectedId ? styles.activePlayer : ""}`}
            title={`Player ${p.id}`}
          >
            {p.id === "MOCK_USER" ? "M" : p.id.toString().slice(0, 2)}
          </div>
        ))}
      </div>
    </div>
  );
}
