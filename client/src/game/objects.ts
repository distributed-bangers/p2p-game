import * as THREE from 'three'
import * as Physics from '../physics'
import { Snapshot } from './snapshots'
import { GameClient, Inputs } from '../client'


abstract class PhysicsObject extends Physics.CollidableMesh implements Physics.Updatable, Physics.Snapshotable<Snapshot> {
    getSnapshot(): Snapshot {
        return { x: this.position.x, z: this.position.z, y: this.quaternion.y, w: this.quaternion.w }
    }

    setFromSnapshot(snapshot: Snapshot) {
        this.position.set(snapshot.x, this.position.y, snapshot.z)
        this.setRotationFromQuaternion(new THREE.Quaternion(0, snapshot.y, 0, snapshot.w))
    }
}

export class Player extends PhysicsObject {
    bullets: Bullet[] = []
    inputs: Inputs = {
        moveDown: false, moveLeft: false, moveRight: false, moveUp: false, shoot: false,
    }
    gun: Gun
    shootCooldown = 0
    onCollision = () => this.material = new THREE.MeshBasicMaterial({ color: 'green' })

    constructor(color: THREE.ColorRepresentation) {
        const playerGeometry = new THREE.CapsuleGeometry(1, 1, 4, 8)
        const playerMaterial = new THREE.MeshBasicMaterial({ color: color })
        super(playerGeometry, playerMaterial)
        this.position.y = 1.5

        this.gun = new Gun()
        this.add(this.gun)

        this.gun.translateZ(1)
        this.gun.translateY(0.7)
        this.gun.rotateX(THREE.MathUtils.degToRad(90))
    }

    spawnBullet() {
        const bullet = new Bullet()

        this.gun.getWorldPosition(bullet.position)
        this.getWorldQuaternion(bullet.quaternion)

        this.parent!.add(bullet)
        this.bullets.push(bullet)
    }

    update() {
        this.updateInputs()

        super.update()
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

export class Bullet extends PhysicsObject {
    constructor() {
        const bulletGeometry = new THREE.SphereGeometry(0.1)
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 'red' })

        super(bulletGeometry, bulletMaterial)
    }
}