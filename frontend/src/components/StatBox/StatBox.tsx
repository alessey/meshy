import styles from "./StatBox.module.css";

type StatBoxProps = {
  label: string;
  value: string | number;
};

export default function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className={styles.statItem}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}
