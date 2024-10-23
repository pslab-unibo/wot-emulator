import Servient from "@node-wot/core";
import { ThingInterface } from "../thing-model/ThingInterface";
import { Content } from "@node-wot/core"; 

export class Scheduler {
    private servient: Servient;
    private period: number;

    constructor(period: number, servient: Servient) {
        this.servient = servient; 
        this.period = period;
    }

    public addThing(thing: ThingInterface): boolean {
        return this.servient.addThing(thing);
    }

    private wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async schedule(): Promise<void> {
        
        try {
            const things = this.servient.getThings();
            
            for (const thing of Object.values(things)) {
                console.log(`Thing ID: ${thing.id}, Title: ${thing.title}, tick: ${thing.constructor.name}`);
                const actionName = 'tick';

                if (thing instanceof ThingInterface) {
                    
                    try {
                        console.log(`Invoking action '${actionName}' for Thing: ${thing.id}`);
                        await thing.tick();
                    } catch (error) {
                        console.log(`Error invoking action '${actionName}' for Thing '${thing.id}':`, error);
                    }
                } 
            }
        } catch (error) {
            console.log('Error during scheduling:', error);
        }
    
        await this.wait(this.period);
        
        this.schedule();
    }
    
}
