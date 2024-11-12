import { DefaultContent, Thing } from "@node-wot/core";
import { Readable } from "stream";
import { ThingInterface } from "../thing-model/ThingInterface";
import { eventQueue } from '../simulation/eventQueue';

// Scheduler class to manage periodic actions on Things and process event commands
export class Scheduler {

    private period: number;
    private things: ThingInterface[] = [];

    constructor(period: number) {
        this.period = period;
    }

    public addThing(thing: ThingInterface): void {
        this.things.push(thing);
        console.log(`Thing added: ${thing.getThing().title}`);
    }

    public async start(): Promise<void> {
        console.log("Scheduler started");

        while (true) {
            // Processes queued events asynchronously
            await eventQueue.processQueue();

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
