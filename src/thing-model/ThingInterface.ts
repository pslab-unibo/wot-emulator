import { ExposedThing, Servient } from "@node-wot/core";

export class ThingInterface extends ExposedThing {

    constructor(servient: Servient, init: WoT.ExposedThingInit) {
        super(servient, init); // Passa i parametri corretti alla classe base
    }
    
    tick(): void {}
}
