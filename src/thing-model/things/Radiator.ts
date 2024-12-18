import Servient from "@node-wot/core";
import { SituatedThing } from "../SituatedThing";
import { HeatingEnv } from "../environments/HeatingEnv";
import { eventQueue } from "../../simulation/eventQueue";
import { ok } from "../../utils/action-result"

//* Represents a radiator that emits heat to an environment when turned on.
class Radiator extends SituatedThing<HeatingEnv> {

    private isOn : boolean = false;
    private power : number = 0;

    private static initBase : WoT.ExposedThingInit = {
        description: "A radiator that emits heat",
        forms: [
            {
                href: "things",  
                op: ["readproperty", "writeproperty", "observeproperty"],
                contentType: "application/json"
            }
        ],
        properties: {
            power: {
                type: "number",
                description: "The fixed power level of the radiator",
                observable: false,
                readOnly: true,
                writeOnly: false,
                forms: [
                    {
                        href: "power",  
                        op: ["readproperty"],
                        contentType: "application/json"
                    }
                ]
            },
            isOn: {
                type: "boolean",
                description: "The current state of the radiator (on/off)",
                observable: true,
                readOnly: false,
                writeOnly: false,
                forms: [
                    {
                        href: "isOn",  
                        op: ["readproperty", "writeproperty", "observeproperty"],
                        contentType: "application/json"
                    }
                ]
            }
        },
        actions: {
            toggle: {
                description: "Turns the radiator on or off",
                forms: [
                    {
                        href: "toggle",  
                        op: ["invokeaction"]
                    }
                ]
            }
        }
    };
    
    constructor(servient: Servient, 
                init: WoT.ExposedThingInit, 
                environment : HeatingEnv) {

        super(servient, init, Radiator.initBase, environment);

        this.setActionHandler("toggle", async() => {
            eventQueue.enqueueEvent(async () => {
                this.isOn = !this.isOn;
                console.log(`Radiator state toggled to: ${this.isOn}`);
            });
            return ok();
        });

        this.setPropertiesDefaultHandler(init);

        this.configureProperties(init);
        this.setReadHandler('isOn');

    }

    /* Updates the state of the radiator based on the elapsed time.
     Emits heat to the environment if the radiator is turned on.*/
    public update(deltaTime : number) {
        if(this.isOn){
            eventQueue.enqueueEvent(() => this.environment
                .increaseTemperature(this.power*deltaTime));
        }
    }

}

//Factory function to create a new Radiator instance.
export function create(servient: Servient, 
    init: any, 
    environment : HeatingEnv,   
    period: number): Radiator {
        return new Radiator(servient, init, environment);
}
