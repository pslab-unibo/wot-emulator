import Servient from "@node-wot/core";
import { Thing } from "./Thing";

export abstract class SituatedThing extends Thing{
    
    protected environment : Thing;

    constructor(servient: Servient, init: WoT.ExposedThingInit, environment : Thing) {
        super(servient, init);
        this.environment = environment;
    }

}