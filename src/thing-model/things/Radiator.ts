import Servient from "@node-wot/core";
import { Thing } from "../Thing";
import { SituatedThing } from "../SituatedThing";
import { HeatingEnv } from "../environments/HeatingEnv";
import { eventQueue } from "../../simulation/eventQueue";;

//* Represents a radiator that emits heat to an environment when turned on.
class Radiator extends SituatedThing {

    private isOn : boolean = false;

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
                environment : Thing, 
                map : Map<string, any> =new Map<string, unknown>()) {

        super(servient, init, Radiator.initBase, environment, map);

        this.thing.setActionHandler("toggle", async () => {
            eventQueue.enqueueEvent(async () => {
                this.isOn = !this.isOn;
                console.log(`Radiator state toggled to: ${this.isOn}`);
            });
            return undefined;
        });

        this.setupPropertyHandler('power');

        this.getThing().setPropertyReadHandler("isOn", async () => {
            return this.isOn;
        });

    }

    /* Updates the state of the radiator based on the elapsed time.
     Emits heat to the environment if the radiator is turned on.*/
    protected update(deltaTime : number) {
        if(this.isOn){
            try {
                console.log("Emit increase event");
                if(this.environment instanceof HeatingEnv) {
                    eventQueue.enqueueEvent(() => (this.environment as HeatingEnv)
                    .increaseTemperature(this.properties.get('power')*deltaTime));
                }
            } catch (error) {
                console.log(error);
            }
            
        }
    }

}

//Factory function to create a new Radiator instance.
export function create(servient: Servient, 
    init: any, 
    environment : Thing,   
    period: number, 
    map : Map<string, any>): Radiator {
        return new Radiator(servient, init, environment, map);
}
