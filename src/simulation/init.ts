import { Scheduler } from "./scheduler";
import * as fs from 'fs';
import { ServientManager } from "./ServientManager";
import { Thing } from "../thing-model/Thing";
import { json } from "stream/consumers";

//Initializes the simulation by setting up the environment and Things.
export async function initialize(scheduler: Scheduler) {
    // Load servient configuration from the JSON file
    const servientConfig = JSON.parse(fs.readFileSync('./src/td/config.json', 'utf8')).servients;

    // Creates an instance of ServientManager to manage multiple servients
    const servients : ServientManager = new ServientManager(servientConfig);

    // Initialize the environment and Things
    initializeEnvironment(scheduler, servients)
            .then((environment) => initializeThings(scheduler, servients, environment));
    
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
async function initializeThings(scheduler: Scheduler, servients : ServientManager, environment : Thing) {
    // Load configuration data for Things from the JSON file
    const configData = JSON.parse(fs.readFileSync('./src/td/config.json', 'utf8')).things;
    
    for (const thingConfig of configData) {
        try { 
               
            // Retrieves the servient based on the Thing configuration; defaults to servient with ID 0 if undefined
            const servient = servients.getServient(thingConfig.servient);
            
            if (servient) {
                
                const thingModule = await import(`../thing-model/things/${thingConfig.type}`);
                
                // Create the Thing using the imported module and configuration data
                const thing = thingModule.create(servient, thingConfig, environment, thingConfig.period);

                // Exposes the Thing to make it available for interaction
                await thing.getThing().expose();
                scheduler.addThing(thing);
            } 
    
        } catch (error) {
            console.error(`Failed to add thing: ${error}`);
        }
    }
}
