import { ExposedThing, Servient } from "@node-wot/core";

export abstract class Thing {

    protected thing: ExposedThing;                  // ExposedThing instance representing the Thing              
    protected lastUpdateTime: number = Date.now();    // Tracks elapsed time since the last update
    protected properties : Map<string, any> = new Map();

    constructor(servient: Servient, init: WoT.ExposedThingInit, initBase: WoT.ExposedThingInit = {}, map : Map<string, any> =new Map<string, any>()) {
        const fullInit = {
            "@context": "https://www.w3.org/2019/wot/td/v1",
            "@type": "Thing",
            ...initBase,
            ...init
        } as WoT.ExposedThingInit;

        this.thing = new ExposedThing(servient, fullInit);
        this.properties = map;
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
