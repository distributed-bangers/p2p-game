import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


let moveUp = false
let moveDown = false
let moveLeft = false
let moveRight = false
let shoot = false
let shootCooldown = 0

const enemies: Player[] = []

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
    gun: Gun
    bullets: Bullet[] = []

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

function onKeyDown(event: KeyboardEvent) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveUp = true
            break

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true
            break

        case 'ArrowDown':
        case 'KeyS':
            moveDown = true
            break

        case 'ArrowRight':
        case 'KeyD':
            moveRight = true
            break
        case 'Space':
            shoot = true
            break
    }
}

function onKeyUp(event: KeyboardEvent) {
    switch (event.code) {

        case 'ArrowUp':
        case 'KeyW':
            moveUp = false
            break

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false
            break

        case 'ArrowDown':
        case 'KeyS':
            moveDown = false
            break

        case 'ArrowRight':
        case 'KeyD':
            moveRight = false
            break

        case 'Space':
            shoot = false
            break
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
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

const player = new Player('red')
scene.add(player)

// Event Listeners
window.addEventListener('resize', onWindowResize, false)
document.addEventListener('keydown', onKeyDown)
document.addEventListener('keyup', onKeyUp)

// Helper
const axesHelper = new THREE.AxesHelper(200)
scene.add(axesHelper)
createTestEnvironment()

function animate() {
    requestAnimationFrame(animate)
    shootCooldown -= 1

    if (moveUp) {
        player.translateZ(0.15)
    }
    if (moveDown) {
        player.translateZ(-0.15)
    }
    if (moveLeft) {
        // player.translateX(-0.1)
        player.rotateY(0.06)
    }
    if (moveRight) {
        // player.translateX(0.1)
        player.rotateY(-0.06)
    }
    if (shoot && shootCooldown <= 0) {
        player.shoot()
        shootCooldown = 60
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

    // const relativeCameraOffset = new THREE.Vector3(0, 20, 5)
    // const cameraOffset = relativeCameraOffset.applyMatrix4(player.matrixWorld)

    camera.position.x = player.position.x
    camera.position.y = player.position.y + 20
    camera.position.z = player.position.z + 5

    // controls.update()

    render()
}

animate()
