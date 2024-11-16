import { Thing } from "../thing-model/Thing";
import { eventQueue } from '../simulation/eventQueue';

// Scheduler class to manage update on Things and process event commands
export class Scheduler {

    private period: number;         // The interval (in milliseconds) for periodic updates
    private environment? : Thing;
    private things: Thing[] = [];

    constructor(period: number) {
        this.period = period;
    }

    public addThing(thing: Thing): void {
        this.things.push(thing);
        console.log(`Thing added: ${thing.getThing().title}`);
    }

    public setEnvironment(env : Thing) {
        console.log("Set environment");
        this.environment = env;
    }

    /**
     * Starts the Scheduler, performing periodic updates on all Things
     * and processing queued events in an infinite loop.
     */
    public async start(): Promise<void> {
        console.log("Scheduler started");

        while (true) {
            // Processes queued events asynchronously
            await eventQueue.processQueue();

            if(this.environment) {
                this.environment.tick();
            }

            // Iterates through each Thing to invoke the 'update' if it exists
            for (const thing of this.things) {
                thing.tick();
            }
            
            await this.wait(this.period);
        }
    }

    private wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
}
