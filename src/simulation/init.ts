import { Scheduler } from "./scheduler";
import * as fs from 'fs';
import { ServientManager } from "./ServientManager";
import { Thing } from "../thing-model/Thing";
import { HeatingEnv } from "../thing-model/environments/HeatingEnv";

export async function initializeThings(scheduler: Scheduler) {
    // Reads configuration data for Things from a JSON file
    const configData = JSON.parse(fs.readFileSync('./src/td/config.json', 'utf8'));
    const envConfig = configData.environment;

    // Creates an instance of ServientManager to manage multiple servients
    const servients : ServientManager = new ServientManager(configData.things);

    const serv = servients.getServient(0)
    var env = undefined;
    
    if(serv) {
        const envModule = await import(`../thing-model/environments/${envConfig[0].type}`);
        env = envModule.create(serv, envConfig, new Map(Object.entries(envConfig[0])));
        scheduler.setEnvironment(env);
        env.getThing().expose();
    }

    for (const thingConfig of configData.things) {
        try {
            const thingType = thingConfig.type;
            const period = thingConfig.period;
            
            // Retrieves the servient based on the Thing configuration; defaults to servient with ID 0 if undefined
            const servient = servients.getServient(thingConfig.servient) || servients.getServient(0);
            
            if (servient) {
                
                const thingModule = await import(`../thing-model/things/${thingType}`);
                const thing = thingModule.create(servient, thingConfig, env as Thing, period, new Map(Object.entries(thingConfig)))
                console.log(thing);
                // Exposes the Thing to make it available for interaction
                await thing.getThing().expose();
        
                scheduler.addThing(thing);
            } 
    
        } catch (error) {
            console.error(`Failed to add thing: ${error}`);
        }
    }
}
