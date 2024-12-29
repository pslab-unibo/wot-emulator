import Servient from "@node-wot/core";
import { Room } from "../../environments/museum/Room";
import { SituatedThing } from "../../SituatedThing";

export abstract class MuseumThing extends SituatedThing<Room> {

    private roomId : string = '';

    constructor(servient: Servient, init: WoT.ExposedThingInit, 
        initBase: WoT.ExposedThingInit = {}, 
        environment : Room) {
            
        super(servient, init, initBase, environment);
        this.roomId = this.environment.getTitle();
    }

    public abstract update(deltaTime: number): void;

}