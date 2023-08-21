export interface Updatable {
    needsUpdate: boolean

    update(): void
}

export function isUpdatable(any: any): any is Updatable {
    return typeof any === 'object' && any !== null && (any as Updatable).update !== undefined
}
