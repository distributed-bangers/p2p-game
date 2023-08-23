import * as THREE from 'three'
import { Updatable } from './updatable'

import { PhysicsScene } from './physicsScene'

export class CollidableMesh<
    TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
    TMaterial extends THREE.Material | THREE.Material[] = THREE.Material | THREE.Material[],
> extends THREE.Mesh<TGeometry, TMaterial> implements Updatable {
    override readonly type: string | 'Collidable'

    onCollision?: (collisionTarget: THREE.Object3D) => void

    needsUpdate: true

    rayCaster: THREE.Raycaster = new THREE.Raycaster

    protected constructor(geometry?: TGeometry, material?: TMaterial) {
        super(geometry, material)

        this.type = 'Collidable'
        this.needsUpdate = true

        this.addEventListener('added', () => this.onAdded())
    }

    private onAdded(): void {
        if ((this.parent as PhysicsScene).isPhysicsScene) {
            (this.parent as PhysicsScene).collidableMeshes.push(this)
        }
    }

    update(): void {
        this.checkCollision()
    }

    checkCollision(): void {
        /*
        for (let vertexIndex = 0; vertexIndex < this.geometry.attributes.position.array.length; vertexIndex++) {
            const localVertex = new THREE.Vector3().fromBufferAttribute(this.geometry.attributes.position, vertexIndex).clone()
            const globalVertex = localVertex.applyMatrix4(this.matrix)
            const directionVector = globalVertex.sub(this.position)

            this.rayCaster.set(this.position, directionVector.clone().normalize())

            const collisionResults = this.rayCaster.intersectObjects((this.parent as PhysicsScene).collidableMeshes)

            if (collisionResults.length > 0 && collisionResults[0].object.id !== this.id && this.children.every(value => collisionResults[0].object.id !== value.id) && collisionResults[0].distance < directionVector.length()) {
                if (!this.onCollision) return
                this.onCollision(collisionResults[0].object)
            }
        }
        */
    }
}