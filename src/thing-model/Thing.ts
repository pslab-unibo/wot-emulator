import { ExposedThing, Servient } from "@node-wot/core";

export abstract class Thing {

    protected thing: ExposedThing;                  // ExposedThing instance representing the Thing              
    private lastUpdateTime: number = Date.now();    // Tracks elapsed time since the last update

    constructor(servient: Servient, 
                init: WoT.ExposedThingInit, 
                initBase: WoT.ExposedThingInit = {}) {

        const fullInit = {
            "@context": "https://www.w3.org/2019/wot/td/v1",
            "@type": "Thing",
            ...initBase,
            ...init
        } as WoT.ExposedThingInit;

        this.thing = new ExposedThing(servient, fullInit);
    }

    public getLastUpdateTime() : number{
        return this.lastUpdateTime;
    }

    public setLastUpdateTime(newTime : number) : void{
        this.lastUpdateTime = newTime;
    }

    /**
     * Abstract method to be implemented by subclasses.
     * Defines the specific behavior of the Thing during updates.
     */
    public abstract update(deltaTime: number): void;

    public getThing(): ExposedThing {
        return this.thing;
    }

    protected configureProperties(init: WoT.ExposedThingInit): void {
        try {
            Object.keys(init).forEach(key => {
                if (key in this) {
                    (this as any)[key] = init[key];
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
    
    

}
