import { ExposedThing, Servient } from "@node-wot/core";

export class ThingInterface {

    thing: ExposedThing;
    eventTickRate : number = 0;
    ticksFromLastEvent = 0;

    constructor(servient: Servient, init: WoT.ExposedThingInit, eventTickRate : number) {
        this.thing = new ExposedThing(servient, init);
        this.eventTickRate = eventTickRate;

        this.thing.setActionHandler("tick", async () => {
            this.ticksFromLastEvent++; 
            if (this.eventTickRate == this.ticksFromLastEvent) {
                this.tickEvent();
                this.ticksFromLastEvent = 0;  
            }

            return Promise.resolve(undefined); 
        });
    }

    tickEvent(): void {}

    getThing(): ExposedThing {
        return this.thing;
    }
}
