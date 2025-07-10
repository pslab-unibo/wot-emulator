import { Scheduler } from "./scheduler";
import { Thing } from "../thing-models/thing";
import { ServientManager } from "./servient-manager";

/**
 * Simulation class orchestrates the WoT simulation by managing servients, environments, and things.
 * It initializes the simulation based on the provided configuration and handles the lifecycle of the simulation.
 */
export class Simulation {

    private scheduler: Scheduler;
    private servientManager: ServientManager;

    constructor(scheduler: Scheduler, servientManager: ServientManager, environment: Thing, things: Thing[]) {
        this.scheduler = scheduler;
        this.servientManager = servientManager;

        this.scheduler.addEnvironment(environment);

        for (const thing of things) {
            this.scheduler.addThing(thing);
        }
    }

    public async start() {
        await this.servientManager.start();
        for (const thing of this.scheduler.getThings()) {
            await thing.expose();
        }
        await this.scheduler.start();
    }

    public async pause() {
       await this.scheduler.pause();
    }

    public async resume() {
        await this.scheduler.resume();
    }

    public async stop() {
        await this.servientManager.stop();
        await this.scheduler.stop();
    }

}