import * as THREE from 'three'
import PeerClient from './peerClient'
import { DataConnection } from 'peerjs'

interface PlayerState {
    moveUp: boolean
    moveDown: boolean
    moveLeft: boolean
    moveRight: boolean
    shoot: boolean
    shootCooldown: number
}

interface GameState {
    [playerId: string]: Player
}

const enemies: Player[] = []

class GameClient {
    id: string
    private peerClient: PeerClient
    player: Player
    peers: DataConnection[] = []
    state: GameState = {}

    private constructor(peerClient: PeerClient) {
        this.peerClient = peerClient
        this.peerClient.on('connection', (dataConnection) => {
            this.onConnection(dataConnection)
        })

        this.id = peerClient.id

        this.player = new Player('blue')
        this.state[this.id] = this.player
        scene.add(this.player)
    }

    static async initialize() {
        const peerClient = await PeerClient.initialize()
        return new GameClient(peerClient)
    }

    private onConnection(dataConnection: DataConnection) {
        this.peers.push(dataConnection)
        dataConnection.on('data', data => this.updateState(dataConnection.peer, data as PlayerState))

        const player = new Player('red')
        this.state[dataConnection.peer] = player
        scene.add(player)
    }

    async connect(id: string) {
        const dataConnection = await this.peerClient.asyncConnect(id)

        this.onConnection(dataConnection)
    }

    publishState() {
        for (const peer of this.peers) {
            //console.log(`Publishing State of Player ${this.id}: ${this.player.state}`)
            peer.send(this.player.state)
        }
    }

    updateState(playerId: string, playerState: PlayerState) {
        //console.log(`Updating State of Player ${playerId}: ${playerState}`)
        this.state[playerId].state = playerState
    }
}

class Bullet extends THREE.Mesh {
    constructor() {
        const bulletGeometry = new THREE.SphereGeometry(0.1)
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 'red' })

        super(bulletGeometry, bulletMaterial)
    }
}

class Gun extends THREE.Mesh {
    constructor() {
        const gunGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1)
        const gunMaterial = new THREE.MeshBasicMaterial({ color: 'black' })

        super(gunGeometry, gunMaterial)
    }
}

class Player extends THREE.Mesh {
    bullets: Bullet[] = []
    gun: Gun
    state: PlayerState = {
        moveUp: false,
        moveDown: false,
        moveLeft: false,
        moveRight: false,
        shoot: false,
        shootCooldown: 0,
    }

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

function createTestEnvironment() {
    const dummy = new Player('blue')
    scene.add(dummy)
    enemies.push(dummy)
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
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            gameClient.player.state.moveUp = true
            break

        case 'ArrowLeft':
        case 'KeyA':
            gameClient.player.state.moveLeft = true
            break

        case 'ArrowDown':
        case 'KeyS':
            gameClient.player.state.moveDown = true
            break

        case 'ArrowRight':
        case 'KeyD':
            gameClient.player.state.moveRight = true
            break
        case 'Space':
            gameClient.player.state.shoot = true
            break
    }
}

function onKeyUp(event: KeyboardEvent) {
    switch (event.code) {

        case 'ArrowUp':
        case 'KeyW':
            gameClient.player.state.moveUp = false
            break

        case 'ArrowLeft':
        case 'KeyA':
            gameClient.player.state.moveLeft = false
            break

        case 'ArrowDown':
        case 'KeyS':
            gameClient.player.state.moveDown = false
            break

        case 'ArrowRight':
        case 'KeyD':
            gameClient.player.state.moveRight = false
            break

        case 'Space':
            gameClient.player.state.shoot = false
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

let gameClient: GameClient
GameClient.initialize().then(async client => {
        gameClient = client
        document.addEventListener('keydown', onKeyDown)
        document.addEventListener('keyup', onKeyUp)
        const otherClient = prompt('other user', '')
        if (otherClient!.length > 0) {
            await gameClient.connect(otherClient!)
        }

        animate()
    },
)


// Event Listeners
window.addEventListener('resize', onWindowResize, false)

// Helper
const axesHelper = new THREE.AxesHelper(200)
scene.add(axesHelper)

// createTestEnvironment()

function animate() {
    requestAnimationFrame(animate)
    gameClient.publishState()

    for (let player of Object.values(gameClient.state)) {
        player.state.shootCooldown -= 1

        if (player.state.moveUp) {
            player.translateZ(0.15)
        }
        if (player.state.moveDown) {
            player.translateZ(-0.15)
        }
        if (player.state.moveLeft) {
            // player.translateX(-0.1)
            player.rotateY(0.06)
        }
        if (player.state.moveRight) {
            // player.translateX(0.1)
            player.rotateY(-0.06)
        }
        if (player.state.shoot && player.state.shootCooldown <= 0) {
            player.shoot()
            player.state.shootCooldown = 60
        }

        for (const bullet of player.bullets) {
            bullet.translateZ(0.5)

            const direction = new THREE.Vector3()
            bullet.getWorldDirection(direction)
            raycaster.set(bullet.position, direction)
            const collisionResults = raycaster.intersectObjects(enemies)

            if (collisionResults.length > 0 && collisionResults[0].distance < 0.5) {
                enemies[0].material = new THREE.MeshBasicMaterial({ color: 'green' })
            }
        }
    }

    // const relativeCameraOffset = new THREE.Vector3(0, 20, 5)
    // const cameraOffset = relativeCameraOffset.applyMatrix4(player.matrixWorld)

    camera.position.x = gameClient.player.position.x
    camera.position.y = gameClient.player.position.y + 20
    camera.position.z = gameClient.player.position.z + 5

    // controls.update()

    render()
}
