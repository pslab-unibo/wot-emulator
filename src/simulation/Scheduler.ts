import { Thing } from "../things/Thing";
import { eventQueue } from "./EventQueue";
import { PeriodicThing } from "../things/PeriodicThing";
import { generateJson, generatePatch, generateUri } from "../utils/jsonUtils";

// Define scheduler states as an enum for better type safety
enum SchedulerState {
    STOPPED = 'stopped',
    RUNNING = 'running',
    PAUSED = 'paused'
}

// Scheduler class to manage update on Things and process event commands
export class Scheduler {

    private period: number;         // The interval (in milliseconds) for periodic updates
    private environment? : Thing;
    private things: Thing[] = [];   // Array of Things managed by the scheduler

    private currentThingState : any[] = [];      

    private state: SchedulerState = SchedulerState.STOPPED; // Current state of the scheduler

    private pauseStartTime: number = 0;     // Timestamp when the scheduler was paused
    private totalPauseTime: number = 0;     // Accumulated pause duration

    constructor(period: number) {
        this.period = period;
    }

    public getEnvironment() {
        return this.environment;
    }

    // Returns the list of Things managed by the scheduler.
    public getThings() {
        return this.things;
    }

    // Adds a Thing to the scheduler.
    public addThing(thing: Thing): void {
        if (!thing) {
            throw new Error('Cannot add undefined or null thing');
        }
        this.things.push(thing);
    }

    // Adds an environment to the scheduler.
    public addEnvironment(env : Thing) {
        if (!env) {
            throw new Error('Cannot set undefined or null environment');
        }
        if(this.environment) {
            console.warn('Environment already set, replacing with new one');
        }
        this.environment = env;
    }

    // Checks if the scheduler is currently running.
    public isRunning(): boolean {
        return this.state === SchedulerState.RUNNING;
    }

    // Checks if the scheduler is currently paused.
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
        this.currentThingState = generateJson(this.things, this.environment);
        this.state = SchedulerState.RUNNING;

        while (this.isRunning()) {
                // Processes queued events asynchronously
                await eventQueue.processQueue();

                // Update environment
                if(this.environment) {
                    this.updateEntity(this.environment);
                }
                
                // Update Things
                for (const thing of this.things) {
                    this.updateEntity(thing);
                }

                // Reset pause time if no longer paused
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

    // Resumes the scheduler from the paused state.
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

    // Stops the scheduler completely and performs cleanup.
    public async stop(): Promise<void> {
        if (this.state === SchedulerState.STOPPED) {
            console.warn('Scheduler is already stopped');
            return;
        }

        console.log("Scheduler stopped");
        this.state = SchedulerState.STOPPED;
        await this.cleanup();
    }

    // Cleans up resources used by the scheduler.
    private async cleanup(): Promise<void> {
        eventQueue.clearQueue();
        this.environment = undefined;
        this.things = [];
        this.pauseStartTime = 0;
        this.totalPauseTime = 0;
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

    // Returns the current state of Things and environments as JSON.
    public getThingState() : any[] {
        return generateJson(this.things, this.environment);
    }

    // Compares the previous state with the current state and returns the changes.
    public getChanges() : any[] {
        const changes = generatePatch(this.currentThingState, this.getThingState());
        this.currentThingState = this.getThingState();
        return changes;
    }

}
