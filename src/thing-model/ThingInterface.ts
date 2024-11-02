import { Content, DefaultContent, ExposedThing, Servient } from "@node-wot/core";
import { Readable } from "stream";

export class ThingInterface {

    thing: ExposedThing;
    period: number;
    timeFromLastTick: number = 0;

    constructor(servient: Servient, init: WoT.ExposedThingInit, period: number) {
        this.thing = new ExposedThing(servient, init);
        this.period = period;

        this.thing.setActionHandler("tick", async (input: WoT.InteractionOutput) => {
                
                    const buffer = await streamToBuffer(input.data as ReadableStream);
                    const basePeriod = JSON.parse(buffer.toString()) as number;
                
                    if (typeof basePeriod === "number") {
                        if (this.updateAndCheckTime(basePeriod)) {
                            await this.tickEvent();
                            this.timeFromLastTick = 0;
                        }
                        return new DefaultContent(Readable.from([this.timeFromLastTick]));
                    }

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

    tickEvent(): void {}

    getThing(): ExposedThing {
        return this.thing;
    }

    private async readNumberFromStream(stream: Readable): Promise<number> {
        for await (const num of stream) {
          return num as number;
        }
        throw new Error('Stream was empty');
    };

    private updateAndCheckTime(basePeriod : any) : boolean {
        if (typeof basePeriod == "number") {
            this.timeFromLastTick += basePeriod;
            if (this.period && this.timeFromLastTick >= this.period) {
                return true;
            } 
        }
        return false;
    }
}
