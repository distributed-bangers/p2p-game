import * as THREE from 'three'
import { PlayerState } from './client'
import { GLBufferAttribute } from 'three'

const playerPositions = []


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

}

onmessage = (event) => {
    const data = event.data
    initialize(data.canvas, data.width, data.height)
}

function render() {
    renderer.render(scene, camera)
}

function onWindowResize(width: number, height: number) {
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    render()
}

let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer

function initialize(canvas: OffscreenCanvas, width: number, height: number) {
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas })
    renderer.setSize(width, height)

    // Camera
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.y = 20
    camera.position.z = 5
    camera.lookAt(0, 0, 0)
}

function animate() {
    requestAnimationFrame(animate)

    /*
    camera.position.x = gameClient.player.position.x
    camera.position.y = gameClient.player.position.y + 20
    camera.position.z = gameClient.player.position.z + 5
    */

    // controls.update()

    render()
}

// Scene
const scene = new THREE.Scene()

// Controls
// const controls = new OrbitControls(camera, renderer.domElement)

// Objects
createBackground()

// Helper
const axesHelper = new THREE.AxesHelper(200)
scene.add(axesHelper)

animate()