import * as Physics from './physics'
import * as THREE from 'three'
import { GameClient } from './client'
import { Meat, Stone} from "./game/objects";


interface cordinates {
    x:number;
    y:number;
}
const random : cordinates[] = [
    {"x": -2.352119197370529, "y": 6.247970792573557},
    {"x": -7.15847792089993, "y": 8.413663127909745},
    {"x": -0.5387001867488198, "y": 4.956735961945073},
    {"x": 6.773918655297274, "y": -8.485209543021529},
    {"x": -5.361896717749862, "y": -0.756606420430014},
    {"x": -8.586703091908474, "y": 4.598224850356968},
    {"x": -4.239943105583108, "y": -0.3498492912645037},
    {"x": -7.159853442111954, "y": -2.303914287032031},
    {"x": 2.0496343822999966, "y": -6.859654789354402},
    {"x": 8.635236499674465, "y": 9.660944053832625},
    {"x": -6.612953771686389, "y": 5.38918849321454},
    {"x": 9.811803848002517, "y": -4.553327758261914},
    {"x": -8.872176086718828, "y": -6.59353587572252},
    {"x": -9.93737293196161, "y": -8.961668952034652},
    {"x": 8.442482715386262, "y": -9.908675994201164},
    {"x": 7.179334735455696, "y": -9.262535234600283},
    {"x": 7.595983735795006, "y": -1.6372264237782457},
    {"x": 0.7498653546507792, "y": 9.579598133334066},
    {"x": -7.82259296704806, "y": -5.045009957359754},
    {"x": -3.4743721033438537, "y": -8.22481981641446},
    {"x": 9.243502389971845, "y": -3.4017539820489944},
    {"x": 6.226608437246407, "y": -5.543718524242465},
    {"x": -0.02705359553401065, "y": -7.632833483253252},
    {"x": 1.972160933416049, "y": -7.19285479409165},
    {"x": 2.2108762704094894, "y": -5.173250453302192},
    {"x": 1.4777948722290467, "y": 5.111569565684795},
    {"x": 5.194664837414068, "y": -1.2445456408569446},
    {"x": -9.619950185940345, "y": -7.489350939183404},
    {"x": 8.231673147251597, "y": -1.4894849053379776},
    {"x": -3.536970381850399, "y": 7.776091843828492},
    {"x": -9.055137485506363, "y": -9.484198243844753},
    {"x": -5.475234818682423, "y": 3.1753198567436795},
    {"x": 4.880919785308363, "y": -8.296001790003628},
    {"x": -3.0614982510843036, "y": -7.174260919509367},
    {"x": -0.7089082092506547, "y": -2.580838145337285},
    {"x": 0.7608197897910472, "y": 7.583212412139385},
    {"x": 5.833258213506342, "y": -7.70095189277671},
    {"x": 1.207380952982201, "y": -0.5817957223922237},
    {"x": 1.9031490597660095, "y": 6.894358980038434},
    {"x": -0.33123693700164524, "y": 8.24696392949122},
    {"x": -2.104261785237186, "y": -9.681389383719968},
    {"x": -0.05298479299207076, "y": -0.7997111221383337},
    {"x": 2.1111391616368917, "y": -8.951297864901294}
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
            if (i%4 == 0){
                let meat = new Meat()
                meat.position.set(random[i].x,random[i].y, 5)
                this.scene.add(meat)
                console.log("meat added")
            }
            else{
                let stone = new Stone()
                stone.position.set(random[i].x,random[i].y, 5)
                this.scene.add(stone)
                console.log("stone added")
            }
        }
    }
}
