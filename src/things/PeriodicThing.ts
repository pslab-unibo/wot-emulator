import { Servient } from "@node-wot/core";
import { SituatedThing } from "../SituatedThing";
import { Thing } from "./Thing";

// Abstract class that extends SituatedThing and adds periodic behavior for the Thing
// EnvType is a generic type that represents the environment the Thing interacts with (a subclass of Thing).
export abstract class PeriodicThing<EnvType extends Thing> extends SituatedThing<EnvType> {

    protected period : number;   // Property to store the period value (time interval for periodic updates)     

    constructor(servient: Servient, 
                init: WoT.ExposedThingInit, 
                initBase: WoT.ExposedThingInit = {}, 
                environment : EnvType,  period : number) {

        super(servient, init, initBase, environment);
        this.period = period; 
    }
    
    // Returns the period (time interval) of the periodic Thing
    public getPeriod() : number {
        return this.period;
    }
    
}
