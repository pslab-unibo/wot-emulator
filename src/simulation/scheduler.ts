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

            //const json1 = this.generateJson(this.things, this.environment);

            // Processes queued events asynchronously
            await eventQueue.processQueue();

            if(this.environment) {
                this.updateEntity(this.environment);
            }

            // Iterates through each Thing to invoke the 'update' if it exists
            for (const thing of this.things) {
                this.updateEntity(thing);
            }

            //const json2 = this.generateJson(this.things, this.environment);
            //console.log(this.generatePatch(json1, json2));
            
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

    private generateJson(things: Thing[], environment?: Thing) {
        if (environment) {
            things = [environment, ...things];
        }
        const thingsJson = things.map(thing => JSON.parse(thing.toString()));
        return thingsJson;
    }
    

    private generatePatch(json1: any, json2: any) {
        const patch: any[] = [];

        for (let i = 0; i < json1.length; i++) {
            const thing1 = json1[i];
            const thing2 = json2[i];

            if (thing1.title !== thing2.title) {
                throw new Error(`Titles do not match for index ${i}: "${thing1.title}" vs "${thing2.title}"`);
            }
    
            const changes: any = { "title": thing1.title };

            Object.keys(thing1).forEach(key => {
                if (key !== "title" && thing1[key] !== thing2[key]) {
                    changes[key] = thing2[key]; 
                }
            });
    
            if (Object.keys(changes).length > 1) {
                patch.push(changes);
            }
        }
    
        return patch;
    }
    
}
