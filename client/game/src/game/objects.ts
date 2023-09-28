import * as THREE from "three";
import * as Physics from "../physics";
import { Snapshot } from "./snapshots";
import { Inputs } from "../client";
import { Updatable } from "../physics";
import { AnimationMixer } from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

abstract class PhysicsObject
  extends Physics.CollidableMesh
  implements Physics.Snapshotable<Snapshot>
{
  getSnapshot(): Snapshot {
    return {
      x: this.position.x,
      z: this.position.z,
      y: this.quaternion.y,
      w: this.quaternion.w,
    };
  }

  setFromSnapshot(snapshot: Snapshot) {
    this.position.set(snapshot.x, this.position.y, snapshot.z);
    this.setRotationFromQuaternion(
      new THREE.Quaternion(0, snapshot.y, 0, snapshot.w),
    );
  }
}

/*
class HealthBar extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.PlaneGeometry(1, hei);
    const material = new THREE.MeshBasicMaterial({ color: "red" });

    const text = new TextGeometry("TEST");

    super(geometry, material);
  }
}*/

export class Player extends PhysicsObject implements Updatable {
  private actions = {};
  private clock = new THREE.Clock();
  health = 100;
  private mixer: AnimationMixer;
  bullets: Bullet[] = [];
  inputs: Inputs = {
    moveDown: false,
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    shoot: false,
  };
  shootCooldown = 0;
  needsUpdate: boolean;

  onCollision = () =>
    (this.material = new THREE.MeshBasicMaterial({ color: "green" }));

  constructor(color: THREE.ColorRepresentation) {
    super();

    loader.load(
      "racoon.glb",
      (gltf) => {
        this.add(gltf.scene.children[0]);
        this.animations = gltf.animations;
      },
      // called while loading is progressing
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // called when loading has errors
      () => {
        console.log("An error happened");
      },
    );

    this.mixer = new AnimationMixer(this);

    this.position.y = 0.1;

    this.needsUpdate = true;

    const moonMassDiv = document.createElement("progress");
    moonMassDiv.max = this.health;
    moonMassDiv.value = this.health;

    const healthBarLabel = new CSS2DObject(moonMassDiv);
    healthBarLabel.position.set(
      this.position.x,
      this.position.y + 3,
      this.position.z,
    );
    this.add(healthBarLabel);
  }

  spawnBullet() {
    const action = this.mixer.clipAction(this.animations[0]);
    action.clampWhenFinished = true;
    action.loop = THREE.LoopOnce;
    action
      .reset()
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(2)
      .fadeIn(1)
      .play();
    const bullet = new Bullet();

    this.getWorldPosition(bullet.position);
    this.getWorldQuaternion(bullet.quaternion);

    this.parent!.add(bullet);
    this.bullets.push(bullet);
  }

  update() {
    this.mixer.update(this.clock.getDelta());
    this.updateInputs();
    this.updateBoundingVolume();
  }

  updateInputs(): void {
    const inputs = this.inputs;

    if (this.shootCooldown > 0) {
      this.shootCooldown -= 1;
    }
    if (inputs.moveUp) {
      this.translateZ(0.15);
    }
    if (inputs.moveDown) {
      this.translateZ(-0.15);
    }
    if (inputs.moveLeft) {
      this.rotateY(0.06);
    }
    if (inputs.moveRight) {
      this.rotateY(-0.06);
    }
    if (inputs.shoot && this.shootCooldown === 0) {
      this.spawnBullet();
      this.shootCooldown = 60;
    }
  }
}

export class Bullet extends PhysicsObject implements Updatable {
  needsUpdate: boolean = true;

  constructor() {
    const bulletGeometry = new THREE.SphereGeometry(0.1);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: "red" });

    super(bulletGeometry, bulletMaterial);

    this.onCollision = (collisionTarget) => {
      const hitPlayer = collisionTarget as Player;

      if (hitPlayer.bullets.includes(this)) return;

      hitPlayer.health -= 50;
      this.removeFromParent();

      if (hitPlayer.health > 0) return;
    };
  }

  update() {
    this.translateZ(0.1);
    this.updateBoundingVolume();
  }
}

export class RigidObject extends Physics.CollidableMesh {
  constructor(color: THREE.ColorRepresentation, vertices: THREE.Vector3) {
    const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const playerMaterial = new THREE.MeshBasicMaterial({ color: color });
    super(playerGeometry, playerMaterial);
    this.position.set(vertices.x, vertices.y, vertices.z);
  }

  onCollision = () =>
    (this.material = new THREE.MeshBasicMaterial({ color: "red" }));
}
