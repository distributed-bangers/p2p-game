import * as THREE from 'three'
import { CollidableMesh } from './collidableMesh'
import { isUpdatable } from './updatable'

import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";

export class PhysicsScene extends THREE.Scene {
    readonly collidableMeshes: CollidableMesh[] = []
    readonly isPhysicsScene = true

    constructor() {
        super();
    }

    updatePhysics(): void {
        this.traverse((object) => {
            if (isUpdatable(object) && object.needsUpdate) {
                object.update()
            }
        })
    }
    async loadFloor(){
        try{
            let textures = {
                dirt: await new THREE.TextureLoader().loadAsync("assets/dirt.png",)
            }
            let mapFloor = new THREE.Mesh(
                new THREE.BoxGeometry(50, 0.01, 50, 50),
                new THREE.MeshBasicMaterial({
                    map: textures.dirt,
                    side: THREE.DoubleSide,
                })
            );
            mapFloor.receiveShadow = true;
            mapFloor.position.set(0, 0, -0.01);
            this.add(mapFloor)
        }
        catch (e){
            console.log(e)
        }
    }
}