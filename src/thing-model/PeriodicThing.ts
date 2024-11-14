import { ExposedThing, Servient } from "@node-wot/core";
import { SituatedThing } from "./SituatedThing";
import { Thing } from "./Thing";

export abstract class PeriodicThing extends SituatedThing {

    protected period : number;                       // Only for periodic Things

    constructor(servient: Servient, init: WoT.ExposedThingInit, environment : Thing, period : number) {
        super(servient, init, environment);
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
