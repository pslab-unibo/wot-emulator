import { ExposedThing, Servient } from "@node-wot/core";
import { ThingInterface } from "../ThingInterface";

export class LampThing extends ThingInterface {

    private intensity: number = 0; 

    constructor(servient: Servient, init: WoT.ExposedThingInit, eventTickRate: number) {
        super(servient, init, eventTickRate);

        this.getThing().setPropertyReadHandler("intensity", async () => {
            return this.intensity;
        });
    
        this.getThing().setPropertyWriteHandler("intensity", async (newValue) => {
            if (typeof newValue === "number" && newValue >= 0 && newValue <= 100) {
                this.intensity = newValue;
                console.log(`Intensity updated to: ${this.intensity}`);
            } else {
                throw new Error("Invalid intensity value. Must be between 0 and 100.");
            }
        });
    }

    public tickEvent(): void {
        this.intensity += 1;
        if (this.intensity > 100) this.intensity = 100; 
        console.log(`Tick action for ${this.getThing().title}, intensity increased to: ${this.intensity}`);
    }
}
