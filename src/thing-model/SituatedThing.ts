import Servient from "@node-wot/core";
import { Thing } from "./Thing";

export abstract class SituatedThing<EnvType extends Thing> extends Thing{
    
    protected environment : EnvType;

    constructor(servient: Servient, init: WoT.ExposedThingInit, 
                initBase: WoT.ExposedThingInit = {}, 
                environment : EnvType) {
                    
        super(servient, init, initBase);
        this.environment = environment;
    }

}