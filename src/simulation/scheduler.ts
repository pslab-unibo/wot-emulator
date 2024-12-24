import { Thing } from "../thing-model/Thing";
import { eventQueue } from '../simulation/eventQueue';
import { PeriodicThing } from "../thing-model/PeriodicThing";
import { servientManager } from "./ServientManager";
import { generateJson, generatePatch } from "../utils/jsonUtils";

// Define scheduler states as an enum for better type safety
enum SchedulerState {
    STOPPED = 'stopped',
    RUNNING = 'running',
    PAUSED = 'paused'
}

// Scheduler class to manage update on Things and process event commands
export class Scheduler {

    private period: number;         // The interval (in milliseconds) for periodic updates
    private environments : Thing[] = [];
    private things: Thing[] = [];

    private json : any[] = [];

    private state: SchedulerState = SchedulerState.STOPPED;

    private pauseStartTime: number = 0;
    private totalPauseTime: number = 0;

    constructor(period: number) {
        this.period = period;
    }

    public getThings() {
        return this.things;
    }

    public addThing(thing: Thing): void {
        if (!thing) {
            throw new Error('Cannot add undefined or null thing');
        }
        this.things.push(thing);
        //console.log(`Thing added: ${thing.getTitle()}`);
    }

    public addEnvironment(env : Thing) {
        if (!env) {
            throw new Error('Cannot set undefined or null environment');
        }
        //console.log("Set environment ", env.getTitle());
        this.environments.push(env);
    }

    public isRunning(): boolean {
        return this.state === SchedulerState.RUNNING;
    }

    private isPaused(): boolean {
        return this.state === SchedulerState.PAUSED;
    }

    /**
     * Starts the Scheduler, performing periodic updates on all Things
     * and processing queued events in an infinite loop.
     */
    public async start(): Promise<void> {
        
        if (this.isRunning()) {
            console.warn('Scheduler is already running');
            return;
        }

        console.log("Scheduler started");
        this.json = generateJson(this.things, this.environments);
        this.state = SchedulerState.RUNNING;

        while (this.isRunning()) {
                // Processes queued events asynchronously
                await eventQueue.processQueue();

                // Iterates through each Thing to invoke the 'update' if it exists
                for (const env of this.environments) {
                    this.updateEntity(env);
                }

                // Iterates through each Thing to invoke the 'update' if it exists
                for (const thing of this.things) {
                    this.updateEntity(thing);
                }

                if (this.totalPauseTime > 0){
                    this.totalPauseTime = 0;
                }

            await this.wait(this.period);
        }
    }

    //Pauses the scheduler execution without stopping it completely
    public pause(): void {
        if (!this.isRunning() || this.isPaused()) {
            console.warn('Cannot pause: scheduler is not running or already paused');
            return;
        }
    
        console.log("Scheduler paused");
        this.state = SchedulerState.PAUSED;
        this.pauseStartTime = Date.now();
    }

    public async resume(): Promise<void> {
        if (this.isRunning() || !this.isPaused()) {
            console.warn('Cannot resume: scheduler is running or not paused');
            return;
        }

        console.log("Scheduler resumed");
        
        if (this.pauseStartTime > 0) {
            this.totalPauseTime = Date.now() - this.pauseStartTime;
            this.pauseStartTime = 0;
        }

        await this.start();
    }

    // Stops the scheduler completely
    public async stop(): Promise<void> {
        if (this.state === SchedulerState.STOPPED) {
            console.warn('Scheduler is already stopped');
            return;
        }

        console.log("Scheduler stopped");
        this.state = SchedulerState.STOPPED;
        await this.cleanup();
    }

    private async cleanup(): Promise<void> {
        eventQueue.clearQueue();
        this.environments = [];
        this.things = [];
        this.pauseStartTime = 0;
        this.totalPauseTime = 0;
        await servientManager.shutdown();
    }
    

    /**Calculates the deltaTime since the last update and calls the update function of the Thing.
    * If the Thing is periodic, it is updated only if the defined period has passed. */
    private updateEntity(entity : Thing) {
        const currentTime: number = Date.now();
        let deltaTime = currentTime - entity.getLastUpdateTime();

        // Subtract the total pause time from delta
        if (this.totalPauseTime > 0) {
            deltaTime -= this.totalPauseTime;
        }

        try {
            if (!(entity instanceof PeriodicThing) || deltaTime >= entity.getPeriod()) {
                entity.update(deltaTime);
                entity.setLastUpdateTime(currentTime);
            }
        } catch(error) {
            console.error(`Error during update for ${entity.getTitle()}:`, error);
        }
    }

    private wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public getJson() : any[] {
        return generateJson(this.things, this.environments);
    }

    public getChanges() : any[] {
        //console.log("Radiator id: " + (this.things[1] as Radiator).id)
        const changes = generatePatch(this.json, this.getJson());
        this.json = this.getJson();
        return changes;
    }

}
