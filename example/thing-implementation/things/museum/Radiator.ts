import Servient from "@node-wot/core";
import { MuseumThing } from "./MuseumThing";
import { eventQueue } from "../../../simulation/eventQueue";
import { ok } from "../../../../library/utils/action-result";
import { Museum } from "../../environments/museum/Museum";

// Represents a radiator that emits heat to an environment when turned on.
class Radiator extends MuseumThing {
   
    public isOn : boolean = false;  // Tracks if the radiator is on or off
    private power : number = 0;     // Power level of the radiator

    // Base structure of the radiator's TD
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
                environment : Museum) {

        super(servient, init, Radiator.initBase, environment);
        
        // Set the action handler for the 'toggle' action (turning the radiator on/off)
        this.setActionHandler("toggle", async() => {
            eventQueue.enqueueEvent(async () => {
                this.isOn = !this.isOn;
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
                .increaseTemperature(this.roomId, this.power*deltaTime))
        }
    }

}

//Factory function to create a new Radiator instance.
export function create(servient: Servient, 
    init: any, 
    environment : Museum): Radiator {
        return new Radiator(servient, init, environment);
}
