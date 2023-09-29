import * as Physics from './physics'
import * as THREE from 'three'
import { GameClient } from './client'
import { Meat, Stone} from "./game/objects";


interface cordinates {
    x:number;
    z:number;
}
const random : cordinates[] = [
    {"x":-6, "z":6},
    {"x": 2, "z": 4},
    {"x": -4, "z": -2},
]

function createBackground() {
    const backgroundGeometry = new THREE.PlaneGeometry(100, 100)
    const backgroundMaterial = new THREE.MeshBasicMaterial()
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial)

    background.rotateX(THREE.MathUtils.degToRad(270))

    return background
}

function createCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    camera.position.y = 10
    camera.position.z = 3
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
        const background = createBackground()
        this.scene.add(background)
        this.addObstaclesAndBonuses()
    }


    initialize(canvas: HTMLCanvasElement | OffscreenCanvas, width: number, height: number) {
        this.canvas = canvas

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas })
        this.renderer.setSize(width, height)

        this.camera.aspect = width / height

        this.animate(0)
        const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
        hemiLight.position.set( 0, 20, 0 );
        this.scene.add( hemiLight );
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
        this.scene.update()
        this.gameClient.sendSnapshot()

        /*
        this.camera.position.x = this.gameClient.player.position.x
        this.camera.position.y = this.gameClient.player.position.y + 20
        this.camera.position.z = this.gameClient.player.position.z + 5
        */

        requestAnimationFrame((time) => this.animate(time))
        this.render()
    }

    render() {
        this.renderer.render(this.scene, this.camera)
    }

    addObstaclesAndBonuses(){
        for (let i = 0; i < random.length; i++) {
            if (i%2 == 0){
                let meat = new Meat()
                meat.position.set(random[i].x, 0,random[i].z)
                this.scene.add(meat)
                console.log(meat.position)
            }
            else{
                let stone = new Stone()
                stone.position.set(random[i].x, 0,random[i].z)
                this.scene.add(stone)
            }
        }
    }
}
