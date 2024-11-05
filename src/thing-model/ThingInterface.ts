import { DefaultContent, ExposedThing, Servient } from "@node-wot/core";
import { Readable } from "stream";

export class ThingInterface {

    protected thing: ExposedThing;                  // ExposedThing instance representing the Thing              
    private lastUpdateTime: number = Date.now();    // Tracks elapsed time since the last update
    private period? : number;                       // Only for periodic Things

    constructor(servient: Servient, init: WoT.ExposedThingInit, period? : number) {
        this.thing = new ExposedThing(servient, init);
        this.period = period; 
    
        // Sets the "update" action handler to manage periodic actions
        this.thing.setActionHandler("update", async () => {
            try {

                const currentTime : number = Date.now();
                const deltaTime = (currentTime - this.lastUpdateTime);

                // If the Thing is not periodic or deltaTime is greater then period
                if (!this.period || deltaTime >= this.period) { 
                    this.update(deltaTime);
                    this.lastUpdateTime = currentTime;
                } 

                return new DefaultContent(Readable.from([deltaTime.toString()]));
            } catch (error) {
                console.log(`Update Error: ${error}`);
            }
        });
    }

    protected update(deltaTime : number): void {}

    public getThing(): ExposedThing {
        return this.thing;
    }
}
