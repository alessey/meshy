import { useMemo } from "react";
import styles from "./Roads.module.css";
import type { Location } from "../../../../src/types";

type RoadsType = {
  worldMap: Record<string, Location> | null;
  gridDims: { r: number; c: number };
};

export default function Roads({ worldMap, gridDims }: RoadsType) {
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
    <svg className={styles.container} viewBox={`0 0 ${gridDims.c * 90} ${gridDims.r * 90}`}>
      {roadPaths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="rgba(201, 125, 26, 0.89)" strokeWidth="4" />
      ))}
    </svg>
  );
}
