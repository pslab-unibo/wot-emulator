import { ExposedThing, Servient } from "@node-wot/core";

export abstract class Thing {

    protected thing: ExposedThing;                  // ExposedThing instance representing the Thing              
    protected lastUpdateTime: number = Date.now();    // Tracks elapsed time since the last update

    constructor(servient: Servient, 
                init: WoT.ExposedThingInit, 
                initBase: WoT.ExposedThingInit = {}, 
                configData : Object = {}) {

        const fullInit = {
            "@context": "https://www.w3.org/2019/wot/td/v1",
            "@type": "Thing",
            ...initBase,
            ...init
        } as WoT.ExposedThingInit;

        this.thing = new ExposedThing(servient, fullInit);
    }

    //Updates the Thing by calling the `update` method and calculating elapsed time.
    public tick() : void {
        const currentTime : number = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime);

        try {
            this.update(deltaTime);
            this.lastUpdateTime = currentTime;
        } catch(error) {
            console.error(`Error during update for ${this.thing.title}:`, error);
        }
    
    }

    /**
     * Abstract method to be implemented by subclasses.
     * Defines the specific behavior of the Thing during updates.
     */
    protected abstract update(deltaTime: number): void;

    public getThing(): ExposedThing {
        return this.thing;
    }

}
