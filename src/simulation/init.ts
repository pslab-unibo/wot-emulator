import { Scheduler } from "./scheduler";
import * as fs from 'fs';
import { ServientManager } from "./ServientManager";
import { Thing } from "../thing-model/Thing";

//Initializes the simulation by setting up the environment and Things.
export async function initialize(scheduler: Scheduler): Promise<void> {
    const servientConfig = JSON.parse(fs.readFileSync('./src/td/config.json', 'utf8')).servients;
    const servients: ServientManager = new ServientManager(servientConfig);

    await servients.start();
    const environment = await initializeEnvironment(scheduler, servients);
    await initializeThings(scheduler, servients, environment);
}

//Initializes the environment by creating it as a Thing and exposing it.
async function initializeEnvironment(scheduler: Scheduler, servients: ServientManager): Promise<Thing> {
    // Load configuration data for the environment from the JSON file
    const configData = JSON.parse(fs.readFileSync('./src/td/config.json', 'utf8'));
    const envConfig = configData.environment;

    const servient = servients.getServient(envConfig.servient);

    if (!servient) {
        throw new Error("No servient found for the environment configuration.");
    }

    try {

        const envModule = await import(`../thing-model/environments/${envConfig[0].type}`);
        
        // Create the environment using the imported module
        const environment = envModule.create(servient, envConfig[0]);
        
        scheduler.setEnvironment(environment);

        // Expose the environment Thing
        await environment.getThing().expose();

        return environment;

    } catch (error) {
        console.error("Failed to initialize environment:", error);
        throw error; 
    }
}

//Initializes all the Things specified in the configuration file.
async function initializeThings(scheduler: Scheduler, servients: ServientManager, environment: Thing) {
    const configData = JSON.parse(fs.readFileSync('./src/td/config.json', 'utf8')).things;
    const exposeStatus : Array<Promise<void>> = [];

    try { 
        for (const thingConfig of configData) {
            const servient = servients.getServient(thingConfig.servient);

            if (servient) {
                const thingModule = await import(`../thing-model/things/${thingConfig.type}`);
                const thing = thingModule.create(servient, thingConfig, environment, thingConfig.period);
                exposeStatus.push(thing.getThing().expose());
                scheduler.addThing(thing);
            } 
        }

        await Promise.all(exposeStatus);
    } catch (error) {
        console.error(`Failed to add thing: ${error}`);
        throw error;
    }
}
