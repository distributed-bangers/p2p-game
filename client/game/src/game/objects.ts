import * as THREE from 'three'
import * as Physics from '../physics'
import { Snapshot } from './snapshots'
import { Inputs } from '../client'
import { Updatable } from '../physics'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";

const loader = new GLTFLoader()
const mtlLoader: MTLLoader = new MTLLoader()

const stoneObject = await new Promise<THREE.Group>((resolve) => {
        mtlLoader.load(
            'stones/Stones.mtl',
            (materials) => {
                materials.preload()

                const objLoader = new OBJLoader()
                objLoader.setMaterials(materials)
                objLoader.load(
                    'stones/Stones.obj',
                    (object) => {
                        object.scale.set(0.5,0.5,0.5)
                        resolve(object)
                    },
                    (xhr) => {
                        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                    },
                    (error) => {
                        console.log('An error happened')
                    }
                )
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log('An error happened')
            }
        )
})

const meatObject = await new Promise<THREE.Group>((resolve) => {
    mtlLoader.load(
        'meat/Meat.mtl',
        (materials) => {
            materials.preload()

            const objLoader = new OBJLoader()
            objLoader.setMaterials(materials)
            objLoader.load(
                'meat/Meat.obj',
                (object) => {
                    object.scale.set(0.5,0.5,0.5)
                    resolve(object)
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                },
                (error) => {
                    console.log('An error happened')
                }
            )
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log('An error happened')
        }
    )
})

const bulletObject = await new Promise<THREE.Group>((resolve) => {
    mtlLoader.load(
        'trashcan/trashcan.mtl',
        (materials) => {
            materials.preload()

            const objLoader = new OBJLoader()
            objLoader.setMaterials(materials)
            objLoader.load(
                'trashcan/trashcan.obj',
                (object) => {
                    object.scale.set(0.5,0.5,0.5)
                    resolve(object)
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                },
                (error) => {
                    console.log('An error happened')
                }
            )
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log('An error happened')
        }
    )
})


abstract class PhysicsObject extends Physics.CollidableMesh implements Physics.Snapshotable<Snapshot> {
    getSnapshot(): Snapshot {
        return { x: this.position.x, z: this.position.z, y: this.quaternion.y, w: this.quaternion.w }
    }

    setFromSnapshot(snapshot: Snapshot) {
        this.position.set(snapshot.x, this.position.y, snapshot.z)
        this.setRotationFromQuaternion(new THREE.Quaternion(0, snapshot.y, 0, snapshot.w))
    }
}

export class Player extends PhysicsObject implements Updatable {
    private actions = {}
    private clock = new THREE.Clock
    private mixer: THREE.AnimationMixer
    bullets: Bullet[] = []
    inputs: Inputs = {
        moveDown: false, moveLeft: false, moveRight: false, moveUp: false, shoot: false,
    }
    shootCooldown = 0
    needsUpdate: boolean

    onCollision = () => this.material = new THREE.MeshBasicMaterial({ color: 'green' })

    constructor(color: THREE.ColorRepresentation) {
        super()
        loader.load('racoon.glb',
            (gltf) => {
                this.add(gltf.scene)
                this.animations = gltf.animations

            },
            // called while loading is progressing
            function(xhr) {

                console.log((xhr.loaded / xhr.total * 100) + '% loaded')

            },
            // called when loading has errors
            function(error) {

                console.log('An error happened')

            })

        this.mixer = new THREE.AnimationMixer(this)
        /*
        const playerGeometry = new THREE.CapsuleGeometry(1, 1, 4, 8)
        const playerMaterial = new THREE.MeshBasicMaterial({ color: color })
        super(playerGeometry, playerMaterial)
        this.position.y = 1.5*/

        this.needsUpdate = true
    }

    spawnBullet() {
        const action = this.mixer.clipAction(this.animations[0])
        action.clampWhenFinished = true
        action.loop = THREE.LoopOnce
        action.reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(2)
            .fadeIn(1).play()
        const bullet = new Bullet(bulletObject.clone())

        this.getWorldPosition(bullet.position)
        this.getWorldQuaternion(bullet.quaternion)

        this.parent!.add(bullet)
        this.bullets.push(bullet)
    }

    update() {
        this.mixer.update(this.clock.getDelta())
        this.updateInputs()
    }

    updateInputs(): void {
        const inputs = this.inputs

        if (this.shootCooldown > 0) {
            this.shootCooldown -= 1
        }
        if (inputs.moveUp) {
            this.translateZ(0.15)
        }
        if (inputs.moveDown) {
            this.translateZ(-0.15)
        }
        if (inputs.moveLeft) {
            this.rotateY(0.06)
        }
        if (inputs.moveRight) {
            this.rotateY(-0.06)
        }
        if (inputs.shoot && this.shootCooldown === 0) {
            this.spawnBullet()
            this.shootCooldown = 60
        }
    }

}

class Gun extends THREE.Mesh {
    constructor() {
        const gunGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1)
        const gunMaterial = new THREE.MeshBasicMaterial({ color: 'black' })

        super(gunGeometry, gunMaterial)
    }
}

export class Bullet extends PhysicsObject implements Updatable{
    needsUpdate: boolean = true
    constructor(trashCan : THREE.Group) {
        super()
        this.add(trashCan)
    }

    update() {
        this.translateZ(0.1)
    }
}

export class Obstacle extends Physics.CollidableMesh {
    constructor(wall: THREE.Group) {
        super()
        this.add(wall)
        this.position.set(0,0,5)
    }
    onCollision = () => this.material = new THREE.MeshBasicMaterial({ color: 'red' })
}
export class Stone extends Obstacle{
    constructor() {
        super(stoneObject);
        this.updateBoundingVolume()
}}

export class Bonus extends Physics.CollidableMesh {
    constructor(meat: THREE.Group) {
        super()
        this.add(meat)
        this.position.set(0,0,5)
    }
    onCollision = () => this.material = new THREE.MeshBasicMaterial({ color: 'red' })
}

export class Meat extends Bonus{
    constructor() {
        super(stoneObject);
        this.updateBoundingVolume()
    }}