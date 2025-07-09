import { Configuration, EnvironmentConfiguration, ThingConfiguration } from "../configuration";
import { ServientManager } from "./servient-manager";
import { Scheduler } from "./scheduler";
import { Thing } from "../thing-models/thing";
import { EventQueue } from "./event-queue";

/**
 * Simulation class orchestrates the WoT simulation by managing servients, environments, and things.
 * It initializes the simulation based on the provided configuration and handles the lifecycle of the simulation.
 */
export class Simulation {

    private servientManager: ServientManager;
    private scheduler: Scheduler;
    private config: Configuration
    private eventQueue: EventQueue = new EventQueue(); // Create a new event queue instance

    constructor(config: Configuration){
        this.scheduler = new Scheduler(config.period, this.eventQueue);
        this.servientManager = new ServientManager(config.servients);
        this.config = config;
    }

    public async initialize() {
        await this.servientManager.start();
        //Add the environment
        const environment = await this.loadEnvironment(this.config.environment, this.config.envFolder);

        //Add the things
        for (const thingConfig of this.config.things) {
            await this.loadThing(thingConfig, environment, this.config.thingFolder);
        }
    }

    private async loadEnvironment(config: EnvironmentConfiguration, path?: string): Promise<Thing> {
        const fullPath = path ? `${path}/${config.type}` : config.type;
        try {
            //load environment and instantiate it
            const servient = this.servientManager.getServient(config.servient);
            const envModule = await import(fullPath);
            const environment = envModule.create(this.eventQueue, servient, config.data);

            //add environment to the simulation and expose it
            this.scheduler.addEnvironment(environment);
            await environment.expose();

            return environment;

        } catch (error) {
            console.error(`Failed to load environment from ${fullPath}:`, error);
            throw error;
        }
    }

    private async loadThing(config : ThingConfiguration, environment: Thing, path?: string) : Promise<Thing> {
        const fullPath = path ? `${path}/${config.type}` : config.type;
        try {
            //load thing and instantiate it
            const servient = this.servientManager.getServient(config.servient);
            const thingModule = await import(fullPath);
            const thing = config.situated ? 
                thingModule.create(this.eventQueue, servient, config.data, environment) 
                : 
                thingModule.create(this.eventQueue, servient, config.data);

            //add thing to the simulation and expose it
            this.scheduler.addThing(thing);
            await thing.expose();

            return thing;

        } catch (error) {
            console.error(`Failed to load thing from ${fullPath}:`, error);
            throw error;
        }
    }

    public async start() {
        await this.scheduler.start();
    }

    public async pause() {
       await this.scheduler.pause();
    }

    public async resume() {
        await this.scheduler.resume();
    }

    public async stop() {
        await this.scheduler.stop();
        await this.servientManager.stop();
    }

}