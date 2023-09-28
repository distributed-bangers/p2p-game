import * as Physics from "./physics";
import * as THREE from "three";
import { GameClient } from "./client";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

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
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);

  hemiLight.position.set(0, 20, 0);

  return hemiLight;
}

export default class Renderer {
  private readonly camera: THREE.PerspectiveCamera;
  private canvas: HTMLCanvasElement | OffscreenCanvas | undefined;
  private lastSnapshotTime = 0;
  private gameClient: GameClient;
  private renderer: THREE.WebGLRenderer;
  private labelRenderer: CSS2DRenderer = new CSS2DRenderer();
  scene: Physics.PhysicsScene;

  constructor(gameClient: GameClient) {
    this.camera = createCamera();
    this.canvas = undefined;
    this.gameClient = gameClient;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.scene = new Physics.PhysicsScene();

    this.scene.loadFloor();
    this.scene.add(createBackground());
    this.scene.add(createLights());

    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.top = "0px";
    document.body.appendChild(this.labelRenderer.domElement);
  }

  initialize(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    width: number,
    height: number,
  ) {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas,
    });
    this.renderer.setSize(width, height);

    this.camera.aspect = width / height;

    this.animate(0);
  }

  onResize(width: number, height: number) {
    this.renderer.setSize(width, height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  addObject(object: THREE.Object3D) {
    this.scene.add(object);
  }

  removeObject(object: THREE.Object3D) {
    this.scene.remove(object);
  }

  animate(time: DOMHighResTimeStamp) {
    this.scene.update(time);

    // only sync snapshots at 20fps
    if (time - this.lastSnapshotTime > 1000 / 20) {
      this.gameClient.sendSnapshot();
      this.lastSnapshotTime =
        time - ((time - this.lastSnapshotTime) % (1000 / 20));
    }

    this.camera.position.x = this.gameClient.player.position.x;
    this.camera.position.y = this.gameClient.player.position.y + 20;
    this.camera.position.z = this.gameClient.player.position.z + 5;

    requestAnimationFrame((time) => this.animate(time));
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }
}
