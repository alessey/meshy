import styles from "./TileIcon.module.css";

interface TileIconProps {
  type?: string;
}

export default function TileIcon({ type }: TileIconProps) {
  if (!type) return null;
  return (
    <img
      src={`/tiles/${type}.svg`}
      className={styles.cellBgIcon}
      alt={type}
      onError={(e) => (e.currentTarget.style.display = "none")}
    />
  );
}
