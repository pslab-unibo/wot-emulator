// import { Simulation } from "../simulation";
// import { ServientManager } from "../simulation/servient-manager";
// import { Thing } from "../thing-models";
// import { Configuration, EnvironmentConfiguration, ThingConfiguration } from "./types";

// export async function loadConfiguration(config: Configuration) : Promise<Simulation> {
//     const period = config.period;
//     const environment = await loadEnvironment(config.environment, config.envFolder);
//     const things: Thing[] = [];

//     for (const thingConfig of config.things) {
//         const thing = await loadThing(thingConfig, environment, config.thingFolder);
//         things.push(thing);
//     }

//     return new Simulation(period, environment, things)
// }


// async function loadEnvironment(config: EnvironmentConfiguration, path?: string): Promise<Thing> {
//     const fullPath = path ? `${path}/${config.type}` : config.type;
//     try {
//         //load environment and instantiate it
//         const servient = this.servientManager.getServient(config.servient);
//         const envModule = await import(fullPath);
//         const environment = envModule.create(this.eventQueue, servient, config.data);

//         //add environment to the simulation and expose it
//         this.scheduler.addEnvironment(environment);
//         await environment.expose();

//         return environment;

//     } catch (error) {
//         console.error(`Failed to load environment from ${fullPath}:`, error);
//         throw error;
//     }
// }

// async function loadThing(config : ThingConfiguration, environment: Thing, path?: string) : Promise<Thing> {
//     const fullPath = path ? `${path}/${config.type}` : config.type;
//     try {
//         //load thing and instantiate it
//         const servient = this.servientManager.getServient(config.servient);
//         const thingModule = await import(fullPath);
//         const thing = config.situated ? 
//             thingModule.create(this.eventQueue, servient, config.data, environment) 
//             : 
//             thingModule.create(this.eventQueue, servient, config.data);

//         //add thing to the simulation and expose it
//         this.scheduler.addThing(thing);
//         await thing.expose();

//         return thing;

//     } catch (error) {
//         console.error(`Failed to load thing from ${fullPath}:`, error);
//         throw error;
//     }
// }
