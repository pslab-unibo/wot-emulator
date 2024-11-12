import { DefaultContent, ExposedThing, Servient } from "@node-wot/core";
import { Readable } from "stream";
import { ThingInterface } from "./ThingInterface";

export class PeriodicThingInterface extends ThingInterface {

    private period : number;                       // Only for periodic Things

    constructor(servient: Servient, init: WoT.ExposedThingInit, period : number) {
        super(servient,init);

        this.period = period; 

    }

    public tick(): void {
        const currentTime : number = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime);

        // If the Thing is not periodic or deltaTime is greater then period
        if (deltaTime >= this.period) { 
            this.update(deltaTime);
            this.lastUpdateTime = currentTime;
        } 
    }

    protected update(deltaTime : number) {}

    public getThing(): ExposedThing {
        return this.thing;
    }
}
