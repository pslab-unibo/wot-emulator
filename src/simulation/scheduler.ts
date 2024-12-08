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
        console.log(`Thing added: ${thing.getTitle()}`);
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
                this.updateEntity(this.environment);
            }

            // Iterates through each Thing to invoke the 'update' if it exists
            for (const thing of this.things) {
                this.updateEntity(thing);
            }
            
            await this.wait(this.period);
        }
    }

    /**Calculates the deltaTime since the last update and calls the update function of the Thing.
    * If the Thing is periodic, it is updated only if the defined period has passed. */
    private updateEntity(entity : Thing) {
        const currentTime : number = Date.now();
        const deltaTime = (currentTime - entity.getLastUpdateTime());

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
    
}
