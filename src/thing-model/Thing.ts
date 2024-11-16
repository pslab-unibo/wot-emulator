import { ExposedThing, Servient } from "@node-wot/core";

export abstract class Thing {

    protected thing: ExposedThing;                  // ExposedThing instance representing the Thing              
    protected lastUpdateTime: number = Date.now();    // Tracks elapsed time since the last update
    protected properties : Map<string, any> = new Map();

    constructor(servient: Servient, 
                init: WoT.ExposedThingInit, 
                initBase: WoT.ExposedThingInit = {}, 
                map : Map<string, any> =new Map<string, any>()) {

        const fullInit = {
            "@context": "https://www.w3.org/2019/wot/td/v1",
            "@type": "Thing",
            ...initBase,
            ...init
        } as WoT.ExposedThingInit;

        this.thing = new ExposedThing(servient, fullInit);
        this.properties = map;
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

    //Sets up a read handler for a specific property.
    protected setupPropertyHandler(propertyName : string) {
        this.getThing().setPropertyReadHandler(propertyName, async () => {
            return this.properties.get(propertyName);
        });
    }

    // Setup default handlers for all properties
    protected setupProperties(): void {
        this.properties.forEach((_, propertyName) => {
            this.setupPropertyHandler(propertyName);
        });
    }
}
