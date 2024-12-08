import { ExposedThing, Servient } from "@node-wot/core";
import { SituatedThing } from "./SituatedThing";
import { Thing } from "./Thing";

export abstract class PeriodicThing<EnvType extends Thing> extends SituatedThing<EnvType> {

    protected period : number;        

    constructor(servient: Servient, 
                init: WoT.ExposedThingInit, 
                initBase: WoT.ExposedThingInit = {}, 
                environment : EnvType,  period : number) {

        super(servient, init, initBase, environment);
        this.period = period; 
    }

    public getPeriod() : number {
        return this.period;
    }
    
}
