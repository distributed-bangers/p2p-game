import * as THREE from 'three'
import * as Physics from '../physics'
import { Snapshot } from './snapshots'
import { Inputs } from '../client'
import { CollidableMesh, Updatable } from '../physics'
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { loseGame } from "../../../frontend/src/shared/gameEvents.js";
import { get } from "svelte/store";
import userState from '../../../frontend/state/user.js';

const loader = new GLTFLoader()
const mtlLoader: MTLLoader = new MTLLoader()

const stoneObject = await new Promise<THREE.Group>((resolve) => {
  mtlLoader.load(
    'stones/Stones.mtl',
    (materials) => {
      materials.preload()

      const objLoader = new OBJLoader()
      objLoader.setMaterials(materials)
      objLoader.load(
        'stones/Stones.obj',
        (object) => {
          object.scale.set(0.15, 0.15, 0.15)
          resolve(object)
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
          console.log('An error happened')
        }
      )
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
      console.log('An error happened')
    }
  )
})

const meatObject = await new Promise<THREE.Group>((resolve) => {
  mtlLoader.load(
    'meat/Meat.mtl',
    (materials) => {
      materials.preload()

      const objLoader = new OBJLoader()
      objLoader.setMaterials(materials)
      objLoader.load(
        'meat/Meat.obj',
        (object) => {
          object.scale.set(0.08, 0.08, 0.08)
          resolve(object)
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
          console.log('An error happened')
        }
      )
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
      console.log('An error happened')
    }
  )
})

const bulletObject = await new Promise<THREE.Group>((resolve) => {
  mtlLoader.load(
    'trashcan/trashcan.mtl',
    (materials) => {
      materials.preload()

      const objLoader = new OBJLoader()
      objLoader.setMaterials(materials)
      objLoader.load(
        'trashcan/trashcan.obj',
        (object) => {
          object.scale.set(0.2, 0.2, 0.2)
          resolve(object)
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
          console.log('An error happened')
        }
      )
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
      console.log('An error happened')
    }
  )
})


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
  public readonly playerId: string;
  private actions = {};
  private clock = new THREE.Clock();
  private _health = 100;
  private mixer: THREE.AnimationMixer;
  private healthBar: HTMLProgressElement;
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

  set health(value: number) {
    this._health = value;
    this.healthBar.value = value;
    console.log(this._health)
  }

  get health() {
    return this._health;
  }

  // onCollision = () =>{

  //     console.log('collided with player')
  // }
  // (this.material = new THREE.MeshBasicMaterial({ color: "green" }));

  constructor(color: THREE.ColorRepresentation, id: string) {
    super();

    this.bullets = [];

    this.playerId = id;
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
    this.updateBoundingVolume();

    this.position.y = 0.1;

    this.mixer = new THREE.AnimationMixer(this)
    /*
    const playerGeometry = new THREE.CapsuleGeometry(1, 1, 4, 8)
    const playerMaterial = new THREE.MeshBasicMaterial({ color: color })
    super(playerGeometry, playerMaterial)
    this.position.y = 1.5*/
    this.needsUpdate = true;

    this.healthBar = document.createElement("progress");
    this.healthBar.max = this.health;
    this.healthBar.value = this.health;

    const healthBarLabel = new CSS2DObject(this.healthBar);
    healthBarLabel.position.set(
      this.position.x,
      this.position.y + 3,
      this.position.z,
    );
    this.add(healthBarLabel);
  }

  spawnBullet() {
    const action = this.mixer.clipAction(this.animations[0])
    action.clampWhenFinished = true
    action.loop = THREE.LoopOnce
    action.reset()
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(2)
      .fadeIn(1).play()
    const bullet = new Bullet(bulletObject.clone(), this.playerId)

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
  playerId: string;
  needsUpdate: boolean = true
  alias = 'bullet'
  constructor(trashCan: THREE.Group, id: string) {
    super()
    this.playerId = id;
    this.add(trashCan)
    this.updateBoundingVolume()
    this.onCollision = (collisionTarget) => {
      const hitPlayer = collisionTarget as Player;
      if (!hitPlayer) return;
      if (hitPlayer.playerId == this.playerId) return;

      if (!hitPlayer.playerId) {
        hitPlayer.health = hitPlayer.health - 50;
        return;
      }

      hitPlayer.health = hitPlayer.health - 50;

      this.removeFromParent();

      if (hitPlayer.health > 0) return;

      if ((hitPlayer as Player).playerId == get(userState).userid) {
        loseGame();
      };
    }
  }

  update() {
    this.translateZ(0.1);
    this.updateBoundingVolume();
  }
}

export class Obstacle extends Physics.CollidableMesh {
  alias = 'obstacle'
  count: number = 0
  constructor(wall: THREE.Group) {
    super()
    this.add(wall)
  }
}

export class Stone extends Obstacle {
  constructor() {
    super(stoneObject.clone());
    this.updateBoundingVolume()
  }
}



export class Bonus extends Physics.CollidableMesh {
  alias = 'bonus'
  constructor(meat: THREE.Group) {
    super()
    this.add(meat)
  }
}

export class Meat extends Bonus {
  constructor() {
    super(meatObject.clone());
    this.updateBoundingVolume()
  }
}
