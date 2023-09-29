export interface SceneSnapshot {
  bullets: Snapshot[];
  player: Snapshot;
}

export interface Snapshot {
  x: number;
  z: number;
  y: number;
  w: number;
}

export function isSceneSnapshot(any: any): any is SceneSnapshot {
  return (
    typeof any === "object" &&
    any !== null &&
    (any as SceneSnapshot).player !== undefined &&
    (any as SceneSnapshot).bullets !== undefined
  );
}
