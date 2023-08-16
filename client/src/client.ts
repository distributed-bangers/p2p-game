import * as THREE from 'three'
import PeerClient from './peerClient'
import { DataConnection } from 'peerjs'

function isPlayerState(any: any): any is Inputs {
    return typeof any === 'object' && any !== null && (any as Inputs).moveUp !== undefined
}

function isPlayerSnapshot(any: any): any is PlayerSnapshot {
    return typeof any === 'object' && any !== null && (any as PlayerSnapshot).x !== undefined
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

interface PlayerSnapshot {
    x: number
    z: number
    y: number
    w: number
}

interface BulletSnapshot {

}

function roughSizeOfObject(object: any) {

    var objectList = []
    var stack = [object]
    var bytes = 0

    while (stack.length) {
        var value = stack.pop()

        if (typeof value === 'boolean') {
            bytes += 4
        } else if (typeof value === 'string') {
            bytes += value.length * 2
        } else if (typeof value === 'number') {
            bytes += 8
        } else if
        (
            typeof value === 'object'
            && objectList.indexOf(value) === -1
        ) {
            objectList.push(value)

            for (var i in value) {
                stack.push(value[i])
            }
        }
    }
    return bytes
}

class GameClient {
    private peerClient: PeerClient

    id: string
    inputs: Inputs = {
        moveDown: false,
        moveLeft: false,
        moveRight: false,
        moveUp: false,
        shoot: false,
    }
    player: Player = new Player('blue')
    peers: Peer[] = []
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

    static async initialize() {
        const peerClient = await PeerClient.initialize()
        return new GameClient(peerClient)
    }

    private onConnection(dataConnection: DataConnection) {
        const peer: Peer = { id: dataConnection.peer, connection: dataConnection }
        this.peers.push(peer)

        const player = new Player('red')
        this.state[peer.id] = player
        scene.add(player)
        dataConnection.on('data', (data) => {
            if (isPlayerSnapshot(data)) {
                this.state[dataConnection.peer].setFromSnapshot(data)
            }
        })

    }

    async connect(id: string) {
        const dataConnection = await this.peerClient.asyncConnect(id)

        this.onConnection(dataConnection)
    }

    sendSnapshot() {
        const snapshot: PlayerSnapshot = this.player.getSnapshot()

        for (const peer of this.peers) {
            peer.connection.send(snapshot)
        }
    }
}

class Player extends THREE.Mesh {
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

    shoot() {
        const bullet = new Bullet()

        this.gun.getWorldPosition(bullet.position)
        this.getWorldQuaternion(bullet.quaternion)

        scene.add(bullet)
        this.bullets.push(bullet)

        const direction = new THREE.Vector3
        bullet.getWorldDirection(direction)
        const arrowHelper = new THREE.ArrowHelper(direction, bullet.position, 100, 'red')
        scene.add(arrowHelper)
    }

    getSnapshot(): PlayerSnapshot {
        return { x: this.position.x, z: this.position.z, y: this.quaternion.y, w: this.quaternion.w }
    }

    setFromSnapshot(snapshot: PlayerSnapshot) {
        this.position.set(snapshot.x, this.position.y, snapshot.z)
        this.setRotationFromQuaternion(new THREE.Quaternion(0, snapshot.y, 0, snapshot.w))
    }
}

class Gun extends THREE.Mesh {
    constructor() {
        const gunGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1)
        const gunMaterial = new THREE.MeshBasicMaterial({ color: 'black' })

        super(gunGeometry, gunMaterial)
    }
}

class Bullet extends THREE.Mesh {
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
    const player = gameClient.player

    if (player.shootCooldown > 0) {
        player.shootCooldown -= 1
    }
    if (inputs.moveUp) {
        player.translateZ(0.15)
    }
    if (inputs.moveDown) {
        player.translateZ(-0.15)
    }
    if (inputs.moveLeft) {
        // player.translateX(-0.1)
        player.rotateY(0.06)
    }
    if (inputs.moveRight) {
        // player.translateX(0.1)
        player.rotateY(-0.06)
    }
    if (inputs.shoot && player.shootCooldown === 0) {
        player.shoot()
        player.shootCooldown = 60
    }

    gameClient.sendSnapshot()

    const enemies: Player[] = []

    /*
    for (const peer in gameClient.state) {
        if (peer !== id) {
            enemies.push(gameClient.state[peer])
        }
    }

    for (const bullet of player.bullets) {
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
}*/

    /*
    camera.position.x = gameClient.player.position.x
    camera.position.y = gameClient.player.position.y + 20
    camera.position.z = gameClient.player.position.z + 5
    */

// controls.update()

    render()
}
