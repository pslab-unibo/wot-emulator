import { ExposedThing } from "@node-wot/core";
import { ThingInterface } from "../thing-model/ThingInterface";

export class Scheduler {

    private period: number;
    private things: Map<string, ThingInterface> = new Map<string, ThingInterface>();

    constructor(period: number) {
        this.period = period;
    }

    public addThing(thing: ThingInterface): boolean {
        if (!this.things.has(thing.id)) {
            this.things.set(thing.id, thing);
            return true;
        } else {
            return false;
        }
    }

    private getThings(): Record<string, WoT.ThingDescription> {
        const ts: { [key: string]: WoT.ThingDescription } = {};
        this.things.forEach((thing, id) => {
            ts[id] = thing.getThingDescription();
        });
        return ts;
    }

    public schedule(): void {
        this.things.forEach((thing, id) => {
            if (typeof thing.tick === "function") {
                thing.tick(); 
            } 
        });
    }
}