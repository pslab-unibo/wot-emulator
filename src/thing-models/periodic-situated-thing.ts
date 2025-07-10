import { Servient } from "@node-wot/core";
import { SituatedThing } from "./situated-thing";
import { Thing } from "./thing";
import { EventQueue } from "../simulation/event-queue";

/**
 * Abstract class representing a periodic Thing
 * This class extends SituatedThing and provides functionality for periodic updates.
 */
export abstract class PeriodicSituatedThing<EnvType extends Thing> extends SituatedThing<EnvType> {

    protected period : number;   // Property to store the period value (time interval for periodic updates)   
    protected lastUpdateTime: number = 0;  

    constructor(queue: EventQueue,
                servient: Servient, 
                td: WoT.ExposedThingInit, 
                environment : EnvType,
                period : number) {

        super(queue, servient, td, environment);
        this.period = period; 
    }
    
    // Returns the period (time interval) of the periodic Thing
    public getPeriod() : number {
        return this.period;
    }

    public update(deltaTime: number): void {
        this.lastUpdateTime+=deltaTime;
        if(this.lastUpdateTime >= this.period) {
            this.lastUpdateTime = 0; // Reset last update time after the period has passed
            this.triggerPeriodicBehaviour(); // Call the abstract method to perform the update
        }
    }

    /**
     * Abstract method to be implemented by subclasses.
     * Defines the specific behavior triggered every period.
     */
    public abstract triggerPeriodicBehaviour(): void; 
    
}
