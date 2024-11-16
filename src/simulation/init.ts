import { Scheduler } from "./scheduler";
import * as fs from 'fs';
import { ServientManager } from "./ServientManager";
import { Thing } from "../thing-model/Thing";

export async function initialize(scheduler: Scheduler) {
    const servientConfig = JSON.parse(fs.readFileSync('./src/td/config.json', 'utf8')).servients;

    // Creates an instance of ServientManager to manage multiple servients
    const servients : ServientManager = new ServientManager(servientConfig);

    initializeEnvironment(scheduler, servients)
            .then((environment) => initializeThings(scheduler, servients, environment));
    
}

async function initializeEnvironment(scheduler: Scheduler, servients: ServientManager): Promise<Thing> {
    const configData = JSON.parse(fs.readFileSync('./src/td/config.json', 'utf8'));
    const envConfig = configData.environment;

    const servient = servients.getServient(envConfig.servient);

    if (!servient) {
        throw new Error("No servient found for the environment configuration.");
    }

    try {
        const envModule = await import(`../thing-model/environments/${envConfig[0].type}`);
        const environment = envModule.create(servient, envConfig, new Map(Object.entries(envConfig[0])));
        scheduler.setEnvironment(environment);
        await environment.getThing().expose();
        return environment;
    } catch (error) {
        console.error("Failed to initialize environment:", error);
        throw error; 
    }
}


async function initializeThings(scheduler: Scheduler, servients : ServientManager, environment : Thing) {
    const configData = JSON.parse(fs.readFileSync('./src/td/config.json', 'utf8')).things;
    
    for (const thingConfig of configData) {
        try {
            const thingType = thingConfig.type;
            const period = thingConfig.period;
            
            // Retrieves the servient based on the Thing configuration; defaults to servient with ID 0 if undefined
            const servient = servients.getServient(thingConfig.servient);
            
            if (servient) {
                
                const thingModule = await import(`../thing-model/things/${thingType}`);
                const thing = thingModule.create(servient, thingConfig, environment, period, new Map(Object.entries(thingConfig)))

                // Exposes the Thing to make it available for interaction
                await thing.getThing().expose();
        
                scheduler.addThing(thing);
            } 
    
        } catch (error) {
            console.error(`Failed to add thing: ${error}`);
        }
    }
}
