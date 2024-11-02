import { Servient } from "@node-wot/core";
import { Scheduler } from "./scheduler";
import { LampThing } from "../thing-model/things/LampThing";
import * as fs from 'fs';

function createThingByType(type: string, eventTickRate: number, servient: Servient, init: WoT.ExposedThingInit) {
    switch (type) {
        case "LampThing":
            return new LampThing(servient, init, eventTickRate);
        default:
            throw new Error(`Unsupported Thing type: ${type}`);
    }
}

export async function initializeThings(servient: Servient, scheduler: Scheduler) {
    const thingsData = JSON.parse(fs.readFileSync('./src/td/things.json', 'utf8'));

    for (const thingConfig of thingsData) {
        try {
            const thingType = thingConfig.type;
            const eventTickRate = thingConfig.eventTickRate;
            const thing = createThingByType(thingType, eventTickRate, servient, thingConfig);
            await thing.getThing().expose();
            scheduler.addThing(thing);
            console.log(`Thing of type ${thingType} exposed and added to scheduler.`);
        } catch (error) {
            console.error(`Failed to add thing: ${error}`);
        }
    }
}
