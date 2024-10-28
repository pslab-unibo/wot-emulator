// src/scheduler.ts

import { DefaultContent } from "@node-wot/core";
import { Readable } from "stream";
import { ThingInterface } from "../thing-model/ThingInterface";

export class Scheduler {
    private period: number;
    private things: ThingInterface[];

    constructor(period: number) {
        this.period = period; 
        this.things = [];
    }

    public addThing(thing: ThingInterface): void {
        this.things.push(thing);
        console.log(`Thing added: ${thing.getThing().title}`);
    }

    public async start(): Promise<void> {
        console.log("Scheduler started");

        while (true) {
            for (const thing of this.things) {
                const th = thing.getThing();
                const actionName = "tick"; 

                if (th.actions && actionName in th.actions) {
                    try {
                        console.log(`Invoking tick action for ${th.title}`);
                        await th.handleInvokeAction(actionName, new DefaultContent(Readable.from([])), { formIndex: 0 });
                    } catch (error) {
                        console.error(`Error invoking tick for ${th.title}:`, error);
                    }
                } else {
                    console.log(`No tick action found for ${th.title}`);
                }
            }
            await this.wait(this.period);
        }
    }

    private wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
