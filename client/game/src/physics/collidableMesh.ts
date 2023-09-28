import * as THREE from 'three'

export abstract class CollidableMesh<
    TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
    TMaterial extends THREE.Material | THREE.Material[] = THREE.Material | THREE.Material[],
> extends THREE.Mesh<TGeometry, TMaterial> {
    override readonly type: string | 'Collidable'

    readonly isCollidable: true

    onCollision?: (collisionTarget: THREE.Object3D) => void

    private boundingVolume: THREE.Box3 = new THREE.Box3()

    protected constructor(geometry?: TGeometry, material?: TMaterial) {
        super(geometry, material)

        this.type = 'Collidable'
        this.isCollidable = true

        this.boundingVolume.setFromObject(this)
    }

    updateBoundingVolume(): void {
        this.boundingVolume.setFromObject(this)
    }

    checkCollisions(meshes: CollidableMesh[]): void {
        for (const mesh of meshes.filter(mesh => mesh !== this)) {
            if (this.onCollision && this.boundingVolume.intersectsBox(mesh.boundingVolume)) this.onCollision(mesh)
        }
    }
}


export function isCollidable(any:any) : any is CollidableMesh {
    return (any as CollidableMesh).isCollidable
}