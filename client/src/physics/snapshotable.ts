export interface Snapshotable<TSnapshot> {
    getSnapshot(): TSnapshot

    setFromSnapshot(snapshot: TSnapshot): void
}