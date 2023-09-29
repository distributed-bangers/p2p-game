import { Updatable } from "./updatable";

export interface Controllable extends Updatable {
  updateInputs(inputs: object): void;
}
