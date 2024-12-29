import { ExposedThing, Servient } from "@node-wot/core";

// Abstract class representing a Thing in the Web of Things (WoT)
export abstract class Thing {

    private thing: ExposedThing;                  // ExposedThing instance representing the Thing              
    private lastUpdateTime: number = Date.now();    // Tracks elapsed time since the last update

    constructor(servient: Servient, 
                init: WoT.ExposedThingInit, 
                initBase: WoT.ExposedThingInit = {}) {

        // Combine base initialization properties with specific initialization properties
        const fullInit = {
            "@context": "https://www.w3.org/2019/wot/td/v1",
            "@type": "Thing",
            ...initBase,
            ...init
        } as WoT.ExposedThingInit;

        this.thing = new ExposedThing(servient, fullInit);
    }

    // Returns the title of the Thing
    public getTitle() : string{
        return this.thing.title;
    }

    // Returns the title of the Thing
    public getId() : string{
        return this.thing.id;
    }

    // Returns the title of the Thing
    public getServient() : string{
        return this.thing.servient;
    }

    // Gets the last update time of the Thing
    public getLastUpdateTime() : number{
        return this.lastUpdateTime;
    }

    // Sets a new update time
    public setLastUpdateTime(newTime : number) : void{
        this.lastUpdateTime = newTime;
    }

    // Exposes the Thing to the network
    public async expose(servient : Servient) : Promise<void>{
        if (servient.addThing(this.thing)){
            return this.thing.expose();
        }
    }

    /**
     * Abstract method to be implemented by subclasses.
     * Defines the specific behavior of the Thing during updates.
     */
    public abstract update(deltaTime: number): void;

    /** 
     * Configures the properties of the Thing based on the provided initialization.
     * It will check for type consistency and assign the values to the properties of this Thing.
     */
    protected configureProperties(init: WoT.ExposedThingInit): void {
        Object.entries(init).forEach(([key, value]) => {
            this.setProperty(key, value);
        });
    }
    
    /**
     * Sets the default read handler for a property.
     * This allows reading the property value directly or using a custom handler.
     */
    protected setReadHandler(propertyName: string, handler?: WoT.PropertyReadHandler): void {
        if (handler) {
            this.thing.setPropertyReadHandler(propertyName, handler);
        } else {
            // Default handler to read the property value from the object
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

    /**
     * Sets the default write handler for a property.
     * This allows modifying the property value directly or using a custom handler.
     */
    protected setWriteHandler(propertyName: string, handler?: WoT.PropertyWriteHandler): void {
        if(handler) {
            this.thing.setPropertyWriteHandler(propertyName, handler);
        } else {
            // Default handler to update the property value
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
            const td = this.thing.getThingDescription().properties;
            if (td && propertyName in td) {
                this.setReadHandler(propertyName);
            } 
        });
    }

    // Sets an action handler for a specific action.
    protected setActionHandler(actionName: string, handler: WoT.ActionHandler) {
        this.thing.setActionHandler(actionName, handler);
    }

    // Emit the specified event
    protected emitEvent(name : string, data: WoT.InteractionInput) {
        this.thing.emitEvent(name, data);
    }
    
    // Sets the value of a property while ensuring type consistency.
    private setProperty(name: string, newValue: any) {
        // Check if the property exists in the Thing Description
        const td = this.thing.getThingDescription()?.properties;
        const isInTD = td && name in td;

        // Check if the property exists in the class
        const isInClass = name in this;

        if (isInTD || isInClass) {
            const typedName = name as keyof this;
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
            } 
        } 
    }


    // Returns a JSON representation of the Thing.
    public toString(): string {
        const excludeFields = ['environment', 'initBase', 'thing', 'lastUpdateTime'];
    
        return JSON.stringify(
            {
                title: this.getTitle(), 
                type: this.constructor.name, 
                ...Object.getOwnPropertyNames(this)
                    .filter(field => 
                        typeof (this as any)[field] !== 'function' && !excludeFields.includes(field)
                    )
                    .reduce((obj: { [field: string]: any }, field) => { 
                        obj[field] = (this as any)[field];
                        return obj;
                    }, {})
            }
        );
    }
    
}
