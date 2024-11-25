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
        Object.entries(init).forEach(([key, value]) => {
            if (key in this) {
                const typedKey = key as keyof this;
                if (typedKey in this) {
                    if (typeof value === typeof this[typedKey]) {
                        (this as any)[typedKey] = value;
                    } else {
                        console.warn(`Type mismatch for property '${key}'.`);
                    }
                }
            }
        });
    }
    
    protected setDefaultHandler(propertyName: string): void {
        if (!(propertyName in this)) {
            console.warn(`Cannot set handler for '${propertyName}': Property does not exist.`);
            return;
        }
    
        this.getThing().setPropertyReadHandler(propertyName as string, async () => {
            try {
                return (this as any)[propertyName];
            } catch (error) {
                console.error(`Error reading property '${propertyName}':`, error);
                throw error;
            }
        });
    }
    
    protected setPropertiesHandler(init: WoT.ExposedThingInit): void {
        Object.keys(init).forEach(propertyName => {
            if (propertyName in this) {
                this.setDefaultHandler(propertyName);
            } 
        });
    }
    
    

}
