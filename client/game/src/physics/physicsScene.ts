import * as THREE from "three";
import { CollidableMesh, isCollidable } from "./collidableMesh";
import { isUpdatable } from "./updatable";

export class PhysicsScene extends THREE.Scene {
  constructor() {
    super();
  }

  update(time: DOMHighResTimeStamp): void {
    const collidableMeshes: CollidableMesh[] = this.children.filter((object) =>
      isCollidable(object),
    ) as CollidableMesh[];

    this.traverse((object) => {
      if (isUpdatable(object) && object.needsUpdate) {
        object.update(time);
      }

      if (isCollidable(object)) {
        object.checkCollisions(collidableMeshes);
      }
    });
  }

  async loadFloor() {
    try {
      const textures = {
        dirt: await new THREE.TextureLoader().loadAsync("assets/dirt.png"),
      };
      const mapFloor = new THREE.Mesh(
        new THREE.BoxGeometry(50, 0.01, 50, 50),
        new THREE.MeshBasicMaterial({
          map: textures.dirt,
          side: THREE.BackSide,
        }),
      );
      mapFloor.receiveShadow = true;
      mapFloor.position.set(0, 0, -0.01);
      this.add(mapFloor);
    } catch (e) {
      console.log(e);
    }
  }
}
