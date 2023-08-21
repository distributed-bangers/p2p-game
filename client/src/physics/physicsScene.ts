import * as THREE from 'three'
import { CollidableMesh } from './collidableMesh'
import { isUpdatable } from './updatable'

export class PhysicsScene extends THREE.Scene {
    readonly collidableMeshes: CollidableMesh[] = []
    readonly isPhysicsScene = true

    updatePhysics(): void {
        this.traverse((object) => {
            if (isUpdatable(object) && object.needsUpdate) {
                object.update()
            }
        })
    }
}