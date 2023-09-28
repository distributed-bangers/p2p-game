import * as THREE from 'three'
import { CollidableMesh, isCollidable } from './collidableMesh'
import { isUpdatable } from './updatable'

export class PhysicsScene extends THREE.Scene {
    constructor() {
        super()
    }

    update(): void {
        const collidableMeshes: CollidableMesh[] = this.children.filter(object => isCollidable(object)) as CollidableMesh[]

        this.traverse((object) => {
            if (isUpdatable(object) && object.needsUpdate) {
                object.update()
            }

            if (isCollidable(object)) {
                object.checkCollisions(collidableMeshes)
            }
        })
    }
}