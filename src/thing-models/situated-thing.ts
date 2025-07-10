import Servient from "@node-wot/core";
import { Property, Thing } from "./thing";
import { EventQueue } from "../simulation/event-queue";

/**
 * Abstract class representing a Situated Thing.
 * This class extends the Thing class and adds functionality for a Thing that is situated in a specific environment.
 * EnvType is a generic type that represents the environment the Thing interacts with (a subclass of Thing).
 */
export abstract class SituatedThing<EnvType extends Thing> extends Thing{
    
    protected environment : EnvType; // Property to store the environment the Thing is situated in (EnvType)

    constructor(queue: EventQueue, 
                servient: Servient,
                td: WoT.ExposedThingInit, 
                environment : EnvType,
                state: Map<string, Property<any>>) {
                    
        super(queue, servient, td, state);
        this.environment = environment;
    }

}