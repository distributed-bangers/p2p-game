import * as THREE from 'three'
import PeerClient from './peerClient'
import { DataConnection } from 'peerjs'

let showHelpers = false

function isSceneSnapshot(any: any): any is SceneSnapshot {
    return typeof any === 'object' && any !== null && (any as SceneSnapshot).player !== undefined && (any as SceneSnapshot).bullets !== undefined
}

interface GameState {
    [playerId: string]: Player
}

interface Peer {
    id: string
    connection: DataConnection
}

interface Inputs {
    moveUp: boolean
    moveDown: boolean
    moveLeft: boolean
    moveRight: boolean
    shoot: boolean
}

interface Snapshot {
    x: number
    z: number
    y: number
    w: number
}

interface SceneSnapshot {
    player: Snapshot
    bullets: Snapshot[]
}

class GameClient {
    private peerClient: PeerClient
    readonly id: string
    inputs: Inputs = {
        moveDown: false,
        moveLeft: false,
        moveRight: false,
        moveUp: false,
        shoot: false,
    }
    player: Player = new Player('blue')
    private peers: Peer[] = []
    state: GameState = {}

    private constructor(peerClient: PeerClient) {
        this.peerClient = peerClient
        this.peerClient.on('connection', (dataConnection) => {
            this.onConnection(dataConnection)
        })

        this.id = peerClient.id
        this.state[this.id] = this.player
        scene.add(this.player)
    }

    static async initialize(id?: string) {
        const peerClient = await PeerClient.initialize(id)

        return new GameClient(peerClient)
    }

    private onConnection(dataConnection: DataConnection) {
        const peer: Peer = { id: dataConnection.peer, connection: dataConnection }
        this.peers.push(peer)

        const player = new Player('red')
        this.state[peer.id] = player
        scene.add(player)

        dataConnection.on('data', (data) => {
            if (isSceneSnapshot(data)) {
                const player = this.state[dataConnection.peer]
                player.setFromSnapshot(data.player)

                while (player.bullets.length !== data.bullets.length) {
                    if (player.bullets.length < data.bullets.length) {
                        player.spawnBullet()
                    } else {
                        scene.remove(player.bullets.pop() as Bullet)
                    }
                }

                player.bullets.forEach((bullet, index) => bullet.setFromSnapshot(data.bullets[index]))
            }
        })

    }

    async connect(id: string) {
        const dataConnection = await this.peerClient.asyncConnect(id)

        this.onConnection(dataConnection)
    }

    sendSnapshot() {
        const snapshot: SceneSnapshot = {
            bullets: this.player.bullets.map(bullet => bullet.getSnapshot()),
            player: this.player.getSnapshot(),
        }

        for (const peer of this.peers) {
            peer.connection.send(snapshot)
        }
    }
}

interface Snapshotable {
    getSnapshot(): Snapshot

    setFromSnapshot(snapshot: Snapshot): void
}


class PhysicsObject extends THREE.Mesh implements Snapshotable {
    getSnapshot(): Snapshot {
        return { x: this.position.x, z: this.position.z, y: this.quaternion.y, w: this.quaternion.w }
    }

    setFromSnapshot(snapshot: Snapshot) {
        this.position.set(snapshot.x, this.position.y, snapshot.z)
        this.setRotationFromQuaternion(new THREE.Quaternion(0, snapshot.y, 0, snapshot.w))
    }
}

class Player extends PhysicsObject {
    bullets: Bullet[] = []
    gun: Gun
    shootCooldown = 0

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

        scene.add(bullet)
        this.bullets.push(bullet)

        if(showHelpers) {
            const direction = new THREE.Vector3
            bullet.getWorldDirection(direction)

            const arrowHelper = new THREE.ArrowHelper(direction, bullet.position, 100, 'red')
            scene.add(arrowHelper)
        }
    }


    update(inputs: Inputs) {
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

class Bullet extends PhysicsObject {
    constructor() {
        const bulletGeometry = new THREE.SphereGeometry(0.1)
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 'red' })

        super(bulletGeometry, bulletMaterial)
    }
}

function createBackground() {
    const backgroundGeometry = new THREE.PlaneGeometry(100, 100)
    const backgroundMaterial = new THREE.MeshBasicMaterial()
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial)

    background.rotateX(THREE.MathUtils.degToRad(270))

    scene.add(background)
}

function createCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.y = 20
    camera.position.z = 5
    camera.lookAt(0, 0, 0)
    return camera
}

function render() {
    renderer.render(scene, camera)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}


function onKeyDown(event: KeyboardEvent) {
    const inputs = gameClient.inputs

    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            inputs.moveUp = true
            break
        case 'ArrowLeft':
        case 'KeyA':
            inputs.moveLeft = true
            break
        case 'ArrowDown':
        case 'KeyS':
            inputs.moveDown = true
            break
        case 'ArrowRight':
        case 'KeyD':
            inputs.moveRight = true
            break
        case 'Space':
            inputs.shoot = true
            break
    }
}

function onKeyUp(event: KeyboardEvent) {
    const inputs = gameClient.inputs

    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            inputs.moveUp = false
            break
        case 'ArrowLeft':
        case 'KeyA':
            inputs.moveLeft = false
            break
        case 'ArrowDown':
        case 'KeyS':
            inputs.moveDown = false
            break
        case 'ArrowRight':
        case 'KeyD':
            inputs.moveRight = false
            break
        case 'Space':
            inputs.shoot = false
            break
    }
}

// Scene
const scene = new THREE.Scene()
const raycaster = new THREE.Raycaster()

// Camera
const camera = createCamera()

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Controls
// const controls = new OrbitControls(camera, renderer.domElement)

// Objects
createBackground()

// Event Listeners
window.addEventListener('resize', onWindowResize, false)

// Helper
const axesHelper = new THREE.AxesHelper(200)
scene.add(axesHelper)

//const stats = new Stats()

let gameClient: GameClient
GameClient.initialize().then(async client => {
        gameClient = client
        document.addEventListener('keydown', onKeyDown)
        document.addEventListener('keyup', onKeyUp)
        const otherClient = prompt('other user', '')
        if (otherClient!.length > 0) {
            await gameClient.connect(otherClient!)
            // await gameClient.startGame()
        }

        animate()
    },
)

async function animate() {
    requestAnimationFrame(animate)

    const inputs = gameClient.inputs
    gameClient.player.update(inputs)

    const enemies: Player[] = []

    for (const peer in gameClient.state) {
        if (peer !== gameClient.id) {
            enemies.push(gameClient.state[peer])
        }
    }

    for (const bullet of gameClient.player.bullets) {
        console.log(bullet.quaternion)
        const direction = new THREE.Vector3()
        bullet.translateZ(0.5)
        bullet.getWorldDirection(direction)
        raycaster.set(bullet.position, direction)

        for (const enemy of enemies) {
            const collisionResults = raycaster.intersectObject(enemy)

            if (collisionResults.length > 0 && collisionResults[0].distance < 0.5) {
                enemy.material = new THREE.MeshBasicMaterial({ color: 'green' })
            }
        }
    }

    gameClient.sendSnapshot()

    render()
}
