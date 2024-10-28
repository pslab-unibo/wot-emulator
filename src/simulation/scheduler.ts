// src/scheduler.ts

import { DefaultContent } from "@node-wot/core";
import { Readable } from "stream";
import { ThingInterface } from "../thing-model/ThingInterface";
import { commandEmitter } from '../command/CommandEmitter';

export class Scheduler {
    private period: number;
    private things: Map<string, ThingInterface> = new Map();

    constructor(period: number) {
        this.period = period;

        commandEmitter.on('command', ({ thingId, action }) => {
            this.handleCommand(thingId, action);
        });
    }

    public addThing(thing: ThingInterface): void {
        this.things.set(thing.getThing().id, thing);
        console.log(`Thing added: ${thing.getThing().title}`);
    }

    public async start(): Promise<void> {
        console.log("Scheduler started");

        while (true) {
            for (const thing of this.things) {
                const th = thing[1].getThing();
                const actionName = "tick"; 

                if (th.actions && actionName in th.actions) {
                    try {
                        //console.log(`Invoking tick action for ${th.title}`);
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

    private handleCommand(thingId: string, actionName: string) {
        const thing = this.things.get(thingId);

        if (!thing) {
            console.log(`Thing with ID ${thingId} not found.`);
            return;
        }

        thing.getThing().handleInvokeAction(actionName, new DefaultContent(Readable.from([])), { formIndex: 0 });
    }
    
}
