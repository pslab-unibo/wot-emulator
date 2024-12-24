import { Scheduler } from "./scheduler";
import * as fs from 'fs';
import { servientManager } from "./ServientManager";
import { CONFIG, THING_MODEL, ENV_MODEL } from "../main";
import { Thing } from "../thing-model/Thing";

//Initializes the simulation by setting up the environment and Things.
export async function initialize(scheduler: Scheduler): Promise<void> {
    const servientConfig = JSON.parse(fs.readFileSync(CONFIG, 'utf8')).servients;
    await servientManager.initializeServients(servientConfig);

    await servientManager.start();
    const environments = await initializeEnvironments(scheduler);
    await initializeThings(scheduler, environments);
}

// Initializes the environment by creating it as a Thing and exposing it.
async function initializeEnvironments(scheduler: Scheduler): Promise<Map<string, any>> {
    // Load configuration data for the environment from the JSON file
    const configData = JSON.parse(fs.readFileSync(CONFIG, 'utf8')).environments;
    const exposeStatus: Array<Promise<void>> = [];
    const environmentMap: Map<string, any> = new Map();

    try {
        for (const envConfig of configData) {
            const servient = servientManager.getServient(envConfig.servient);

            if (servient) {
                const envModule = await import(ENV_MODEL + `${envConfig.type}`);
                const environment = envModule.create(servient, envConfig);
                
                exposeStatus.push(environment.expose(servient));
                scheduler.addEnvironment(environment);

                // Add the environment to the map with its ID as the key
                environmentMap.set(envConfig.id, environment);
            }
        }

        // Wait for all exposures to complete
        await Promise.all(exposeStatus);
    } catch (error) {
        console.error(`Failed to add thing: ${error}`);
        throw error;
    }

    return environmentMap;
}


//Initializes all the Things specified in the configuration file.
async function initializeThings(scheduler: Scheduler, environments: Map<string, any>) {
    const configData = JSON.parse(fs.readFileSync(CONFIG, 'utf8')).things;
    const exposeStatus : Array<Promise<void>> = [];

    try { 
        for (const thingConfig of configData) {
            const servient = servientManager.getServient(thingConfig.servient);

            if (servient) {
                const thingModule = await import(THING_MODEL+`${thingConfig.type}`);
                const thing = thingModule.create(servient, thingConfig, environments.get(thingConfig.environment), thingConfig.period);
                exposeStatus.push(thing.expose(servient));
                scheduler.addThing(thing);
            } 
        }

        await Promise.all(exposeStatus);
    } catch (error) {
        console.error(`Failed to add thing: ${error}`);
        throw error;
    }
}