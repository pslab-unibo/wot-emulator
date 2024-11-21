import Servient from "@node-wot/core";
import { Thing } from "./Thing";

export abstract class SituatedThing extends Thing{
    
    protected environment : Thing;

    constructor(servient: Servient, init: WoT.ExposedThingInit, 
                initBase: WoT.ExposedThingInit = {}, 
                environment : Thing, 
                configData : Object = {}) {
                    
        super(servient, init, initBase);
        this.environment = environment;
    }

}