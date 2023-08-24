import * as Physics from './physics'
import * as THREE from 'three'
import { GameClient } from './client'
import {Player, RigidObject} from './game/objects'
import {CollidableMesh} from "./physics";

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
    private gameClient: GameClient
    private renderer: THREE.WebGLRenderer
    scene: Physics.PhysicsScene
    collidableMeshList: CollidableMesh[]


    constructor(gameClient: GameClient) {
        this.camera = createCamera()
        this.gameClient = gameClient
        this.renderer = new THREE.WebGLRenderer()
        this.scene = new Physics.PhysicsScene()
        this.collidableMeshList = []
        this.scene.loadFloor()
        const background = createBackground()
        this.scene.add(background)
    }

    initialize(canvas: HTMLCanvasElement | OffscreenCanvas, width: number, height: number) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas })
        this.renderer.setSize(width, height)

        this.camera.aspect = width/height

        this.animate(0)
    }

    addPlayer(player: Player) {
        this.scene.add(player)
    }
    addCollidableMesh(collidableMesh:RigidObject){
        this.scene.add(collidableMesh)
    }


    animate(time: number) {
        requestAnimationFrame((time) => this.animate(time))
        this.scene.updatePhysics()
        this.gameClient.sendSnapshot()
        this.render()
    }


    render() {
        this.renderer.render(this.scene, this.camera)
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer?.setSize(window.innerWidth, window.innerHeight)
        this.render()
    }
}
