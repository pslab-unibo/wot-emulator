import { ExposedThing, Servient } from "@node-wot/core";

export abstract class Thing {

    protected thing: ExposedThing;                  // ExposedThing instance representing the Thing              
    protected lastUpdateTime: number = Date.now();    // Tracks elapsed time since the last update

    constructor(servient: Servient, init: WoT.ExposedThingInit) {
        this.thing = new ExposedThing(servient, init);
    }

    public tick() : void {
        const currentTime : number = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime);
        this.update(deltaTime);
        this.lastUpdateTime = currentTime;
    }

    protected update(deltaTime : number): void {}

    public getThing(): ExposedThing {
        return this.thing;
    }
}
