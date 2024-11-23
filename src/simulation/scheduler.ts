import { Thing } from "../thing-model/Thing";
import { eventQueue } from '../simulation/eventQueue';
import { PeriodicThing } from "../thing-model/PeriodicThing";

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
                const currentTime : number = Date.now();
                const deltaTime = (currentTime - this.environment.getLastUpdateTime());
                this.environment.update(deltaTime);
                this.environment.setLastUpdateTime(currentTime);
            }

            // Iterates through each Thing to invoke the 'update' if it exists
            for (const thing of this.things) {
                const currentTime : number = Date.now();
                const deltaTime = (currentTime - thing.getLastUpdateTime());

                try {
                    if (!(thing instanceof PeriodicThing) || deltaTime >= thing.getPeriod()) {
                        thing.update(deltaTime);
                        thing.setLastUpdateTime(currentTime);
                    }
                } catch(error) {
                    console.error(`Error during update for ${thing.getThing().title}:`, error);
                }
            }
            
            await this.wait(this.period);
        }
    }

    private wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
}
