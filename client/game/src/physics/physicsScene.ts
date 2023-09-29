import * as THREE from "three";
import { CollidableMesh, isCollidable } from "./collidableMesh";
import { isUpdatable } from "./updatable";

/**
 * Central part of the physics engine.
 */
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
                object.checkCollisions(collidableMeshes)
            }
        })
    }
}