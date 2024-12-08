import { ExposedThing, Servient } from "@node-wot/core";

// Abstract class representing a Thing in the Web of Things (WoT)
export abstract class Thing {

    private thing: ExposedThing;                  // ExposedThing instance representing the Thing              
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

    public getTitle() {
        return this.thing.title;
    }

    public getLastUpdateTime() : number{
        return this.lastUpdateTime;
    }

    public setLastUpdateTime(newTime : number) : void{
        this.lastUpdateTime = newTime;
    }

    public expose() {
        this.thing.expose();
    }

    /**
     * Abstract method to be implemented by subclasses.
     * Defines the specific behavior of the Thing during updates.
     */
    public abstract update(deltaTime: number): void;

    /** Configures the properties of the Thing based on the provided initialization.
     * It will check for type consistency and assign the values to the properties of this Thing.*/
    protected configureProperties(init: WoT.ExposedThingInit): void {
        Object.entries(init).forEach(([key, value]) => {
            this.setProperty(key, value);
        });
    }
    
    //Sets the default read handler for a property, allowing its value to be read.
    protected setReadHandler(propertyName: string, handler?: WoT.PropertyReadHandler): void {
        if (handler) {
            this.thing.setPropertyReadHandler(propertyName, handler);
        } else {
            // Set the read handler to return the property value
            this.thing.setPropertyReadHandler(propertyName, async () => {
                try {
                    return (this as any)[propertyName];
                } catch (error) {
                    console.error(`Error reading property '${propertyName}':`, error);
                    throw error;
                }
            });
        }
    }

    //Sets the default write handler for a property, allowing its value to be read.
    protected setWriteHandler(propertyName: string, handler?: WoT.PropertyWriteHandler): void {
        if(handler) {
            this.thing.setPropertyWriteHandler(propertyName, handler);
        } else {
            // Set the write handler to return the property value
            this.thing.setPropertyWriteHandler(propertyName, async (newValue) => {
                try {
                    this.setProperty(propertyName, newValue);
                } catch (error) {
                    console.error(`Error writing property '${propertyName}':`, error);
                    throw error;
                }
            });
        }
    }
    
    // Sets default read handlers for all properties defined in the initialization object.
    protected setPropertiesDefaultHandler(init: WoT.ExposedThingInit): void {
        Object.keys(init).forEach(propertyName => {
            if (propertyName in this) {
                this.setReadHandler(propertyName);
            } 
        });
    }

    protected setActionHandler(actionName: string, handler: WoT.ActionHandler) {
        this.thing.setActionHandler(actionName, handler);
    }
    
    private setProperty(name: string, newValue: any) {
        if (name in this) {
            const typedName = name as keyof this;
            if (typedName in this) {
                if (newValue === undefined) {
                    (this as any)[typedName] = newValue;
                    return;
                }
                if (this[typedName] === undefined) {
                    (this as any)[typedName] = newValue;
                    return;
                }
                if (typeof newValue === typeof this[typedName]) {
                    (this as any)[typedName] = newValue;
                } else {
                    console.warn(`Type mismatch for property '${name}'. 
                        Expected ${typeof this[typedName]}, got ${typeof newValue}`);
                }
            }
        }
    }

}
