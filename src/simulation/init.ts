import { Servient, ThingInteraction } from "@node-wot/core";
import { Scheduler } from "./scheduler";
import { LampThing } from "../thing-model/things/LampThing";
import * as fs from 'fs';
import { ServientManager } from "./ServientManager";
import { ThingInterface } from "../thing-model/ThingInterface";

// Factory function to create a Thing instance based on its type
function createThingByType(type: string, period: number, servient: Servient, init: WoT.ExposedThingInit) : ThingInterface {
    switch (type) {
        case "LampThing":
            return new LampThing(servient, init, period);
        default:
            throw new Error(`Unsupported Thing type: ${type}`);
    }
}

export async function initializeThings(scheduler: Scheduler) {
    // Reads configuration data for Things from a JSON file
    const thingsData = JSON.parse(fs.readFileSync('./src/td/things.json', 'utf8'));

    // Creates an instance of ServientManager to manage multiple servients
    // SINGLETON ??
    const servients : ServientManager = new ServientManager(thingsData);

    for (const thingConfig of thingsData) {
        try {
            const thingType = thingConfig.type;
            const period = thingConfig.period;
            
            // Retrieves the servient based on the Thing configuration; defaults to servient with ID 0 if undefined
            const servient = servients.getServient(thingConfig.servient) || servients.getServient(0);
            
            if (servient) {

                // Creates the Thing based on its type and attaches it to the servient
                const thing = createThingByType(thingType, period, servient, thingConfig);

                try {
                    // Exposes the Thing to make it available for interaction
                    await thing.getThing().expose();
            
                    scheduler.addThing(thing);
                }catch(error) {
                    console.log(error);
                }
            } 
    
        } catch (error) {
            console.error(`Failed to add thing: ${error}`);
        }
    }
}
