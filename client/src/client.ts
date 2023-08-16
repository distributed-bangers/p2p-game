import * as THREE from 'three'
import PeerClient from './peerClient'
import { DataConnection } from 'peerjs'
import { BufferGeometry } from 'three'

// Physics
const physicsEngine = new Worker('physics.js')

// Rendering
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const offscreen = canvas.transferControlToOffscreen()

const renderThread = new Worker('render.js')
renderThread.postMessage({
    canvas: offscreen,
    width: canvas.clientWidth,
    height: canvas.clientHeight,
}, [offscreen])

function onWindowResize() {
    renderThread.postMessage({
        width: canvas.clientWidth,
        height: canvas.clientHeight,
    })
}

function isPlayerState(any: any): any is PlayerState {
    return typeof any === 'object' && any !== null && (any as PlayerState).moveUp !== undefined
}

physicsEngine.postMessage('test')

interface GameState {
    [playerId: string]: Player
}

interface Peer {
    id: string
    connection: DataConnection
}

export interface PlayerState {
    moveUp: boolean
    moveDown: boolean
    moveLeft: boolean
    moveRight: boolean
    shoot: boolean
    shootCooldown: number
}

physicsEngine.onmessage = (e) => {
    if (typeof e.data === 'string') {
        console.log('my id is', e.data)
        gameClient.id = e.data
    } // else if ((e.data as AddPlayerEvent).id !== undefined) {
        // gameClient.addPlayer(e.data.id)
    //}
    else {
        gameClient.stateChanges = e.data
    }
}

class GameClient {
    private peerClient: PeerClient

    id: string
    player: Player = new Player('blue')
    peers: Peer[] = []
    state: GameState = {}
    stateChanges: GameStateChange = {}

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
        dataConnection.on('data', (data) => {
            if (isPlayerState(data)) {
                peer.queue.push(data as PlayerState)
            } else {
                console.error('Received data in wrong format:', data)
            }
        })
        this.peers.push(peer)
        const player = new Player('red')
        this.player.this.state[peer.id] = player
        this.addPlayer()
    }

    async connect(id: string) {
        const dataConnection = await this.peerClient.asyncConnect(id)

        this.onConnection(dataConnection)
    }

    /*
        async getInputs() {
            const promises = []

            for (const peer of this.peers) {
                promises.push(new Promise<PlayerState>((resolve) => {
                    if (peer.queue.length > 0) {
                        resolve(peer.queue.shift() as PlayerState)
                    } else {
                        peer.connection.once('data', (data) => {
                            resolve(data as PlayerState)
                        })
                    }
                }).then(value => {
                    this.updateState(peer.id, value)
                }).catch(reason => console.error(reason)))
            }

            this.publishState()

            await Promise.all(promises)
        }

        publishState() {
            for (const peer of this.peers) {
                //console.log(`Publishing State of Player ${this.id}: ${this.player.state}`)
                peer.connection.send(this.player.state)
            }
        }

        updateState(playerId: string, playerState: PlayerState) {
            this.state[playerId].state = playerState
        }

    */
    private addPlayer() {

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

class Gun extends THREE.Mesh {
    constructor() {
        const gunGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1)
        const gunMaterial = new THREE.MeshBasicMaterial({ color: 'black' })

        super(gunGeometry, gunMaterial)
    }
}

class Bullet extends THREE.Mesh {
    constructor() {
        const gl = canvas.getContext('webgl') as WebGLRenderingContext
        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        const lol = new THREE.GLBufferAttribute(buffer as WebGLBuffer, gl.UNSIGNED_BYTE, 3, 1, 1)

        const bulletGeometry = new THREE.SphereGeometry(0.1)
        bulletGeometry.setAttribute('position', lol)
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 'red' })

        super(bulletGeometry, bulletMaterial)
    }
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

    // physicsEngine.postMessage(gameClient.player.state)
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

    // physicsEngine.postMessage(gameClient.player.state)
}

const raycaster = new THREE.Raycaster()

// Controls
// const controls = new OrbitControls(camera, renderer.domElement)


// Event Listeners
//window.addEventListener('resize', onWindowResize, false)


export let gameClient: GameClient
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


function animate() {
    requestAnimationFrame(animate)
    for (const id of Object.keys(gameClient.state)) {
        const player = gameClient.state[id]
        const inputs = gameClient.stateChanges[id]

        if (player.state.shootCooldown > 0) {
            player.state.shootCooldown -= 1
        }

        if (inputs.moveUp) {
            player.translateZ(0.15)
        }
        if (inputs.moveDown) {
            player.translateZ(-0.15)
        }
        if (inputs.moveLeft) {
            player.rotateY(0.06)
        }
        if (inputs.moveRight) {
            player.rotateY(-0.06)
        }
        if (inputs.shoot && player.state.shootCooldown === 0) {
            player.shoot()
            player.state.shootCooldown = 60
        }

        const enemies: Player[] = []

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
    }

    /*
    camera.position.x = gameClient.player.position.x
    camera.position.y = gameClient.player.position.y + 20
    camera.position.z = gameClient.player.position.z + 5
    */

    // controls.update()
}
