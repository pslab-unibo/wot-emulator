import Servient from "@node-wot/core";
import { Thing } from "./Thing";

// Abstract class that extends Thing, representing a Thing situated in a specific environment (EnvType)
export abstract class SituatedThing<EnvType extends Thing> extends Thing{
    
    protected environment : EnvType; // Property to store the environment the Thing is situated in (EnvType)

    constructor(servient: Servient, init: WoT.ExposedThingInit, 
                initBase: WoT.ExposedThingInit = {}, 
                environment : EnvType) {
                    
        super(servient, init, initBase);
        this.environment = environment;
    }

}