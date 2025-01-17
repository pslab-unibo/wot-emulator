import Servient from "@node-wot/core";
import { Museum } from "../../environments/museum/Museum";
import { SituatedThing } from "../../SituatedThing";

export abstract class MuseumThing extends SituatedThing<Museum> {

    protected roomId : string = '';

    constructor(servient: Servient, init: WoT.ExposedThingInit, 
        initBase: WoT.ExposedThingInit = {}, 
        environment : Museum) {
            
        super(servient, init, initBase, environment);
        this.roomId = this.environment.getTitle();
    }

    public abstract update(deltaTime: number): void;

}