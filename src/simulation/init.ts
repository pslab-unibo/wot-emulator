import { Scheduler } from "./scheduler";
import * as fs from 'fs';
import { servientManager } from "./ServientManager";
import { Thing } from "../thing-model/Thing";
import { CONFIG, THING_MODEL, ENV_MODEL } from "../main";

//Initializes the simulation by setting up the environment and Things.
export async function initialize(scheduler: Scheduler): Promise<void> {
    const servientConfig = JSON.parse(fs.readFileSync(CONFIG, 'utf8')).servients;
    servientManager.initializeServients(servientConfig);

    await servientManager.start();
    const environment = await initializeEnvironment(scheduler);
    await initializeThings(scheduler, environment);
}

//Initializes the environment by creating it as a Thing and exposing it.
async function initializeEnvironment(scheduler: Scheduler): Promise<Thing> {
    // Load configuration data for the environment from the JSON file
    const configData = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
    const envConfig = configData.environment;

    const servient = servientManager.getServient(envConfig.servient);

    if (!servient) {
        throw new Error("No servient found for the environment configuration.");
    }

    try {

        const envModule = await import(ENV_MODEL+`${envConfig[0].type}`);
        
        // Create the environment using the imported module
        const environment = envModule.create(servient, envConfig[0]);
        
        scheduler.setEnvironment(environment);

        // Expose the environment Thing
        await environment.expose();

        return environment;

    } catch (error) {
        console.error("Failed to initialize environment:", error);
        throw error; 
    }
}

//Initializes all the Things specified in the configuration file.
async function initializeThings(scheduler: Scheduler, environment: Thing) {
    const configData = JSON.parse(fs.readFileSync(CONFIG, 'utf8')).things;
    const exposeStatus : Array<Promise<void>> = [];

    try { 
        for (const thingConfig of configData) {
            const servient = servientManager.getServient(thingConfig.servient);

            if (servient) {
                const thingModule = await import(THING_MODEL+`${thingConfig.type}`);
                const thing = thingModule.create(servient, thingConfig, environment, thingConfig.period);
                exposeStatus.push(thing.expose());
                scheduler.addThing(thing);
            } 
        }

        await Promise.all(exposeStatus);
    } catch (error) {
        console.error(`Failed to add thing: ${error}`);
        throw error;
    }
}
