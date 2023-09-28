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

    camera.position.y = 10
    camera.position.z = 3
    camera.lookAt(0, 0, 0)

    return camera
}

function createLights() {

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
        const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
        hemiLight.position.set( 0, 20, 0 );
        this.scene.add( hemiLight );
    }

    async loadFloor() {
        try {
            let textures = {
                grass: await new THREE.TextureLoader().loadAsync('grass.png'),
                grass1: await new THREE.TextureLoader().loadAsync('grass1.png'),
            }
            const height:number = 0.1
            let hexagonGeometries: Array<THREE.CylinderGeometry> = []
            for (let i = -10; i<= 10;i++ ){
                for (let j = -10; j<= 10;j++ ){
                    let geo = new THREE.CylinderGeometry(0.8,0.8,height,6,1,false)
                    let x = (i + (j%2) * 0.5) *1.40
                    let y = j *1.235
                    geo.translate(x,height,y- 5)
                    hexagonGeometries.push(geo)
                }
            }
            const mergedHexGeometry = BufferGeometryUtils.mergeGeometries(hexagonGeometries)
            const hexagonMesh = new THREE.Mesh(
                mergedHexGeometry,
                new THREE.MeshStandardMaterial({
                    map: textures.grass1,
                    color: '#bacfc0',
                    flatShading: true
                })
            )
            this.scene.add(hexagonMesh)

        } catch (e) {
            console.log(e)
        }
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
}
