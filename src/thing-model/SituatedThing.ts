import Servient from "@node-wot/core";
import { Thing } from "./Thing";

export abstract class SituatedThing extends Thing{
    
    protected environment : Thing;

    constructor(servient: Servient, init: WoT.ExposedThingInit, initBase: WoT.ExposedThingInit = {}, environment : Thing, map : Map<string, any> =new Map<string, any>()) {
        super(servient, init, initBase, map);
        this.environment = environment;
    }

}