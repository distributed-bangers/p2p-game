// Design like this:

// Scene animate calls  Update on network update -> handles syncs

/*
import { Updatable } from "./updatable";

class Network implements Updatable {
  private syncsPerSecond;
  needsUpdate: boolean;

  constructor(syncsPerSecond: number) {
    this.syncsPerSecond = syncsPerSecond;
  }

  update(): void {}
}
*/
