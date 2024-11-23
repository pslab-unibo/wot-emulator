import { ExposedThing, Servient } from "@node-wot/core";
import { SituatedThing } from "./SituatedThing";
import { Thing } from "./Thing";

export abstract class PeriodicThing extends SituatedThing {

    protected period : number;        

    constructor(servient: Servient, 
                init: WoT.ExposedThingInit, 
                initBase: WoT.ExposedThingInit = {}, 
                environment : Thing,  period : number) {

        super(servient, init, initBase, environment);
        this.period = period; 
    }

    public getPeriod() : number {
        return this.period;
    }
    
}
