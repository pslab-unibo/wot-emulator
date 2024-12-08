import { Servient } from "@node-wot/core";
import { eventQueue } from "../../simulation/eventQueue";
import { PeriodicThing } from "../PeriodicThing";
import { ok } from "../../simulation/action-result";
import { HeatingEnv } from "../environments/HeatingEnv";

class LampThing extends PeriodicThing<HeatingEnv> {

    private intensity: number = 0;  // Brightness level of the lamp
    private isOn: boolean = false;  // Power state of the lamp (on/off)

    private static initBase : WoT.ExposedThingInit = {
        "description": "A lamp that can be controlled via Web of Things",
        forms: [
            {
                href: "things",  
                op: ["readproperty", "writeproperty", "observeproperty"],
                contentType: "application/json"
            },
        ],
        "properties": {
            "intensity": {
                "type": "number",
                "description": "The brightness level of the lamp",
                forms: [
                    {
                        href: "intensity", 
                        op: ["readproperty", "writeproperty", "observeproperty"],
                        contentType: "application/json"
                    },
                ],
                "observable": true,
                "readOnly": false,
                "writeOnly": false,
                "minimum": 0,
                "maximum": 100
            },
            "isOn": {
                "type": "boolean",
                "description": "The state of the lamp",
                "observable": true,
                "readOnly": false,
                "writeOnly": false,
                forms: [
                    {
                        href: "isOn",  
                        op: ["readproperty", "writeproperty", "observeproperty"],
                        contentType: "application/json"
                    },
                ]
            }
        },
        "actions": {
            "toggle": {
                "description": "Change the state of the lamp",
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
                environment : HeatingEnv, 
                period: number) {

        super(servient, init, LampThing.initBase, environment, period);

        this.setReadHandler('isOn');
        this.setReadHandler('intensity');

        // Define the "toggle" action to switch the lamp's state
        this.setActionHandler("toggle", async () => {
            eventQueue.enqueueEvent(async () => {
                this.isOn = !this.isOn;
                console.log(`Lamp state toggled to: ${this.isOn}`);
            });
            return ok();
        });
    }

    // Method to simulate periodic behavior (update)
    public update(deltaTime : number): void {
        if (this.isOn) {
            this.intensity += 1;
            if (this.intensity > 100) this.intensity = 100; 
            console.log(`Update for ${this.getTitle()}, intensity increased to: ${this.intensity}`);
        }
    }
}

//Factory function to create a new LampThing instance.
export function create(servient: Servient, 
                        init: WoT.ExposedThingInit, 
                        environment : HeatingEnv,   
                        period: number): LampThing {
    return new LampThing(servient, init, environment, period);
  }
