import { Servient } from "@node-wot/core";
import { Scheduler } from "./scheduler";
import { LampThing } from "../thing-model/things/LampThing";
import * as fs from 'fs';
import { ServientManager } from "./ServientManager";

// Factory function to create a Thing instance based on its type
function createThingByType(type: string, period: number, servient: Servient, init: WoT.ExposedThingInit) {
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

    const servients : ServientManager = new ServientManager(thingsData);

    for (const thingConfig of thingsData) {
        try {
            const thingType = thingConfig.type;
            const period = thingConfig.period;
            const servient = servients.getServient(thingConfig.servient) || servients.getServient(0);
            
            if (servient) {
                const thing = createThingByType(thingType, period, servient, thingConfig);
                console.log(servient);

                // Exposes the Thing to make it available for interaction
                await thing.getThing().expose();

                scheduler.addThing(thing);  // Adds the Thing to the scheduler

                console.log(`Thing of type ${thingType} exposed and added to scheduler.`);
            } 
    
        } catch (error) {
            console.error(`Failed to add thing: ${error}`);
        }
    }
}
