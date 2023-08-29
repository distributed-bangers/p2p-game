import * as Physics from './physics'
import * as THREE from 'three'
import { GameClient } from './client'

function createBackground() {
    const backgroundGeometry = new THREE.PlaneGeometry(100, 100)
    const backgroundMaterial = new THREE.MeshBasicMaterial()
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial)

    background.rotateX(THREE.MathUtils.degToRad(270))

    return background
}

function createCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    camera.position.y = 20
    camera.position.z = 5
    camera.lookAt(0, 0, 0)

    return camera
}

export default class Renderer {
    private readonly camera: THREE.PerspectiveCamera
    private canvas: HTMLCanvasElement | OffscreenCanvas | undefined
    private gameClient: GameClient
    private renderer: THREE.WebGLRenderer
    scene: Physics.PhysicsScene


    constructor(gameClient: GameClient) {
        this.camera = createCamera()
        this.canvas = undefined
        this.gameClient = gameClient
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas })
        this.scene = new Physics.PhysicsScene()

        this.scene.loadFloor()
        const background = createBackground()
        this.scene.add(background)
    }

    initialize(canvas: HTMLCanvasElement | OffscreenCanvas, width: number, height: number) {
        this.canvas = canvas

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas })
        this.renderer.setSize(width, height)

        this.camera.aspect = width / height

        this.animate(0)
    }

    onResize(width: number, height: number) {
        this.renderer.setSize(width, height)

        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
    }

    addObject(object: THREE.Object3D) {
        this.scene.add(object)
    }

    animate(time: number) {
        requestAnimationFrame((time) => this.animate(time))
        this.scene.update()
        this.gameClient.sendSnapshot()

        /*
        this.camera.position.x = this.gameClient.player.position.x
        this.camera.position.y = this.gameClient.player.position.y + 20
        this.camera.position.z = this.gameClient.player.position.z + 5
        */

        this.render()
    }

    render() {
        this.renderer.render(this.scene, this.camera)
    }
}
