import { Servient } from "@node-wot/core";
import { ThingInterface } from "../ThingInterface";

export class LampThing extends ThingInterface {
    private intensity: number = 0; // Intensità corrente della lampada

    constructor(servient: Servient, init: WoT.ExposedThingInit) {
        super(servient, init, 3);
    }

    /**
     * Aumenta l'intensità della lampada di 1 fino a 100.
     */
    private increaseIntensity(): void {
        if (this.intensity < 100) {
            this.intensity++;
            console.log(`Intensità della lampada aggiornata: ${this.intensity}`);
        } else {
            console.log("L'intensità ha raggiunto il massimo (100). Fermando il loop.");
        }
    }

    tickEvent(): void {
        this.increaseIntensity();
    }
}
