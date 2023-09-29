export interface Updatable {
  needsUpdate: boolean;

  update(time: DOMHighResTimeStamp): void;
}

export function isUpdatable(any: unknown): any is Updatable {
  return (
    typeof any === "object" &&
    any !== null &&
    (any as Updatable).update !== undefined
  );
}
