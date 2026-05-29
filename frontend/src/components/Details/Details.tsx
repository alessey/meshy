import type { Player } from "../../../../src/game/player";
import StatBox from "../StatBox/StatBox";
import styles from "./Details.module.css";

type DetailsProps = {
  selectedId: string;
  playerDetails: Player | null;
  setSelectedId: (id: string) => void;
};

export default function Details({ selectedId, playerDetails, setSelectedId }: DetailsProps) {
  if (!selectedId || !playerDetails) {
    return null;
  }

  return (
    <dialog open={Boolean(selectedId && playerDetails)}>
      <article className={styles.detailsSection}>
        <header>
          <button aria-label="Close" rel="prev" onClick={setSelectedId.bind(null, "")} />
          <h2>{playerDetails.id}</h2>
        </header>
        {playerDetails.encounter && (
          <section className={styles.encounterBanner}>
            <strong>Active Encounter: {playerDetails.encounter.type.toUpperCase()}</strong>
          </section>
        )}
        <div className="stats">
          <StatBox label="Location" value={playerDetails.location} />
          <StatBox label="Health" value={`${playerDetails.hp} / ${playerDetails.maxHp}`} />
          <StatBox label="Level" value={`${playerDetails.level} (${playerDetails.xp} XP)`} />
          <StatBox label="Attack" value={playerDetails.attack} />
        </div>

        <div className={styles.equipSection}>
          <section className={styles.section}>
            <h4>Equipment</h4>
            <p>
              Weapon: <strong>{playerDetails.weapon.name}</strong>
            </p>
            <p>
              Armor: <strong>{playerDetails.armor.name}</strong>
            </p>
          </section>
          <section className={styles.section}>
            <h4>Items</h4>
            <ul>
              {playerDetails.items.map((item: any, i: number) => (
                <li key={i}>
                  {item.name} ({item.type || "Item"})
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </dialog>
  );
}
