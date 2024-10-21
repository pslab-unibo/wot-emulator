import { ExposedThing, Servient } from "@node-wot/core";

export class ThingInterface extends ExposedThing {

    eventTickRate : number = 0;
    ticksFromLastEvent = 0;

    constructor(servient: Servient, init: WoT.ExposedThingInit, eventTickRate : number) {
        super(servient, init);
        this.eventTickRate = eventTickRate;
    }
    
    tick(): void {
        this.ticksFromLastEvent++;  
        if (this.eventTickRate == this.ticksFromLastEvent) {
            this.tickEvent();
            this.ticksFromLastEvent = 0;  
        }
    }

    tickEvent(): void {}
}
