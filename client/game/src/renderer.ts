import * as Physics from './physics'
import * as THREE from 'three'
import { GameClient } from './client'
import { Meat, Stone } from './game/objects'
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

interface cordinates {
    x: number;
    z: number;
}
const random: cordinates[] = [
    { "x": -6, "z": 6 },
    { "x": 2, "z": 4 },
    { "x": -4, "z": -2 },
]

function createBackground() {
    const backgroundGeometry = new THREE.PlaneGeometry(100, 100);
    const backgroundMaterial = new THREE.MeshBasicMaterial();
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);

    background.rotateX(THREE.MathUtils.degToRad(270));

    return background;
}

function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );

    camera.position.y = 10;
    camera.position.z = 3;
    camera.lookAt(0, 0, 0);

    return camera;
}

function createLights() {
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3)
    hemisphereLight.position.set(0, 20, 0)

    return hemisphereLight
}

/**
 * Handles the rendering of the game.
 * Also controls the TreeJS Scene.
 * Don't forget to call {@link setCanvas} to start rendering!
 */
export default class Renderer {
    private readonly camera: THREE.PerspectiveCamera
    private lastSnapshotTime = 0;
    private gameClient: GameClient
    private renderer?: THREE.WebGLRenderer
    labelRenderer: CSS2DRenderer = new CSS2DRenderer();
    private lastAnimationFrameId = 0;
    scene: Physics.PhysicsScene


    /**
     *
     * @param gameClient
     */
    constructor(gameClient: GameClient) {
        this.camera = createCamera()
        this.gameClient = gameClient
        this.scene = new Physics.PhysicsScene()
        const background = createBackground()
        this.scene.add(background)
        this.addObstaclesAndBonuses()
        this.scene.add(createBackground());
        this.scene.add(createLights());

        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = "absolute";
        this.labelRenderer.domElement.style.top = "0px";
        document.body.appendChild(this.labelRenderer.domElement);
    }

    stopAnimating() {
        cancelAnimationFrame(this.lastAnimationFrameId)
    }

    // setLabelCanvas(div: HTMLDivElement, width: number, height: number) {
    //     this.labelRenderer.domElement.appendChild(div);
    //     this.labelRenderer.domElement.setAttribute("width", width.toString());
    //     this.labelRenderer.domElement.setAttribute("height", height.toString());
    // }

    /**
     * Call this method to assign a canvas to the Renderer.
     * Will also start rendering the scene.
     * @param canvas Can be a {@link HTMLCanvasElement} or an {@link OffscreenCanvas}.
     * @param width canvas width
     * @param height canvas height
     */
    setCanvas(canvas: HTMLCanvasElement | OffscreenCanvas, width: number, height: number) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas })
        this.renderer.setSize(width, height)

        this.camera.aspect = width / height

        this.animate(Date.now())
    }

    /**
     * Resizes the renderer and adjusts the camera aspect.
     * @param width new width
     * @param height new height
     */
    resize(width: number, height: number) {
        this.renderer?.setSize(width, height)

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    addObject(object: THREE.Object3D) {
        this.scene.add(object);
    }

    removeObject(object: THREE.Object3D) {
        this.scene.remove(object);
    }

    /**
     * Handles updating the {@link PhysicsScene}, syncing state to other clients via {@link GameClient.sendSnapshot}
     * and rendering the new frame.
     * @param time Current timestamp
     */
    animate(time: DOMHighResTimeStamp) {
        this.lastAnimationFrameId =
            requestAnimationFrame((time) => this.animate(time))

        this.scene.update(time)
        this.gameClient.sendSnapshot()

        // only sync snapshots at 20fps
        if (time - this.lastSnapshotTime > 1000 / 20) {
            this.gameClient.sendSnapshot();
            this.lastSnapshotTime =
                time - ((time - this.lastSnapshotTime) % (1000 / 20));
        }

        this.camera.position.x = this.gameClient.player.position.x
        this.camera.position.y = this.gameClient.player.position.y + 20
        this.camera.position.z = this.gameClient.player.position.z + 5

        this.render()
    }

    render() {
        this.renderer?.render(this.scene, this.camera)
        this.labelRenderer.render(this.scene, this.camera);
    }

    addObstaclesAndBonuses() {
        for (let i = 0; i < random.length; i++) {
            if (i % 2 == 0) {
                let meat = new Meat()
                meat.position.set(random[i].x, 0, random[i].z)
                this.scene.add(meat)
                console.log(meat.position)
            }
            else {
                let stone = new Stone()
                stone.position.set(random[i].x, 0, random[i].z)
                this.scene.add(stone)
            }
        }
    }
}
