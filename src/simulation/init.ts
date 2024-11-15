import { Servient, ThingInteraction } from "@node-wot/core";
import { Scheduler } from "./scheduler";
import { LampThing } from "../thing-model/things/LampThing";
import * as fs from 'fs';
import { ServientManager } from "./ServientManager";
import { Thing } from "../thing-model/Thing";
import { HeatingEnv } from "../thing-model/environments/HeatingEnv";
import { Radiator } from "../thing-model/things/Radiator";

// Factory function to create a Thing instance based on its type
function createThingByType(type: string, servient: Servient, init: WoT.ExposedThingInit, environment : Thing, map : Map<string, any> =new Map<string, any>(), period? : number) : Thing {
    switch (type) {
        case "LampThing":
            if(period) {
                return new LampThing(servient, init, environment, period);
            }
        case "Radiator":
                return new Radiator(servient, init, environment, map);
        default:
            throw new Error(`Unsupported Thing type: ${type}`);
    }
}

export async function initializeThings(scheduler: Scheduler) {
    // Reads configuration data for Things from a JSON file
    const thingsData = JSON.parse(fs.readFileSync('./src/td/things.json', 'utf8'));
    const envData = JSON.parse(fs.readFileSync('./src/td/environment.json', 'utf8'));

    // Creates an instance of ServientManager to manage multiple servients
    const servients : ServientManager = new ServientManager(thingsData);

    const serv = servients.getServient(0)
    var env = undefined;
    
    if(serv) {
        env = new HeatingEnv(serv, envData, new Map(Object.entries(envData)));
        scheduler.setEnvironment(env);
        env.getThing().expose();
        //console.log(env);
    }

    for (const thingConfig of thingsData) {
        try {
            const thingType = thingConfig.type;
            const period = thingConfig.period;
            
            // Retrieves the servient based on the Thing configuration; defaults to servient with ID 0 if undefined
            const servient = servients.getServient(thingConfig.servient) || servients.getServient(0);
            
            if (servient) {
                var thing = undefined;
                // Creates the Thing based on its type and attaches it to the servient
                if (thingConfig.power) {
                    thing = createThingByType(thingType, servient, thingConfig, env as Thing, new Map(Object.entries(thingConfig)));
                } else {
                    thing = createThingByType(thingType, servient, thingConfig, env as Thing, undefined, period);
                }

                console.log(thing);
                
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
