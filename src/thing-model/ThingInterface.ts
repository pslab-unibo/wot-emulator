import { Content, DefaultContent, ExposedThing, Servient } from "@node-wot/core";
import { Readable } from "stream";

export class ThingInterface {

    protected thing: ExposedThing;          // ExposedThing instance representing the Thing
    private period: number;                 // Period for the tick event in milliseconds
    private timeFromLastTick: number = 0;   // Tracks elapsed time since the last tick

    constructor(servient: Servient, init: WoT.ExposedThingInit, period: number) {
        this.thing = new ExposedThing(servient, init);
        this.period = period;

        // Sets the "tick" action handler to manage periodic actions
        this.thing.setActionHandler("tick", async (input: WoT.InteractionOutput) => {
                
                    const buffer = await streamToBuffer(input.data as ReadableStream);
                    const basePeriod = JSON.parse(buffer.toString()) as number;
                
                    if (typeof basePeriod === "number") {
                        if (this.updateAndCheckTime(basePeriod)) {
                            this.tickEvent();
                            this.timeFromLastTick = 0;
                        }
                        return new DefaultContent(Readable.from([this.timeFromLastTick]));
                    }

                    // Helper function to read an input stream and convert it to a buffer
                    async function streamToBuffer(readable : ReadableStream) {
                        const chunks = [];
                        const reader = readable.getReader();
                        
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            chunks.push(value);
                        }
                        return Buffer.concat(chunks);
                    }
        });
    }

    protected tickEvent(): void {}

    public getThing(): ExposedThing {
        return this.thing;
    }

    // Updates the elapsed time and checks if it exceeds the defined period
    private updateAndCheckTime(basePeriod : number) : boolean {
        this.timeFromLastTick += basePeriod;
        return (this.timeFromLastTick >= this.period);
    }
}
