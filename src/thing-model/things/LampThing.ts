import { Servient } from "@node-wot/core";
import { eventQueue } from "../../simulation/eventQueue";
import { PeriodicThing } from "../PeriodicThing";
import { Thing } from "../Thing";

export class LampThing extends PeriodicThing {

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
                "writeOnly": false
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

    constructor(servient: Servient, init: WoT.ExposedThingInit, environment : Thing, period: number) {
        super(servient, init, LampThing.initBase, environment, period);

        // Define the read handler for the "intensity" property
        this.getThing().setPropertyReadHandler("intensity", async () => {
            return this.intensity;
        });
        
        // Define the write handler for the "intensity" property with validation
        this.getThing().setPropertyWriteHandler("intensity", async (newValue) => {
            if (typeof newValue === "number" && newValue >= 0 && newValue <= 100) {
                this.intensity = newValue;
                console.log(`Intensity updated to: ${this.intensity}`);
            } else {
                throw new Error("Invalid intensity value. Must be between 0 and 100.");
            }
        });

        // Define the read handler for the "isOn" property
        this.getThing().setPropertyReadHandler("isOn", async () => {
            return this.isOn;
        });
        
        // Define the write handler for the "isOn" property with validation
        this.getThing().setPropertyWriteHandler("isOn", async (newValue) => {
            if (typeof newValue === "boolean") {
                this.isOn = newValue;
                console.log(`Change state in: ${this.isOn}`);
            } else {
                throw new Error("Invalid state value. Must be a boolean");
            }
        });

        // Define the "toggle" action to switch the lamp's state
        this.thing.setActionHandler("toggle", async () => {
            eventQueue.enqueueEvent(async () => {
                this.isOn = !this.isOn;
                console.log(`Lamp state toggled to: ${this.isOn}`);
            });
            return {
                statusCode: 202, 
                message: "Lamp toggle action accepted" 
            };
        });
    }

    // Method to simulate periodic behavior (update)
    public update(deltaTime : number): void {
        if (this.isOn) {
            this.intensity += 1;
            if (this.intensity > 100) this.intensity = 100; 
            console.log(`Update for ${this.getThing().title}, intensity increased to: ${this.intensity}`);
        }
    }
}
