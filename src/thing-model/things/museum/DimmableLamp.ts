import Servient, { Helpers } from "@node-wot/core";
import { SituatedThing } from "../../SituatedThing";
import { Room } from "../../environments/museum/Room";
import { eventQueue } from "../../../simulation/eventQueue";
import { ok } from "../../../utils/action-result";
import { MuseumThing } from "./MuseumThing";
import { Museum } from "../../environments/museum/Museum";

class DimmableLamp extends MuseumThing {

    private intensity: string = "medium";  // Brightness level of the lamp
    private isOn: boolean = false;  // Power state of the lamp (on/off)

    private static initBase : WoT.ExposedThingInit = {
        "description": "A lamp that can change intensity level",
        forms: [
            {
                href: "things",  
                op: ["readproperty", "writeproperty", "observeproperty"],
                contentType: "application/json"
            },
        ],
        "properties": {
            "intensity": {
                "type": "string",
                "description": "The brightness level of the lamp",
                "enum": ["high", "medium", "low"],
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
            },
            "setLow": {
                "description": "Set a low intensity level",
                input: { type: 'string' },
                forms: [
                    {
                        href: "setLow", 
                        response: { contentType: "application/json" },
                        mediaType: "application/json", 
                        op: ["invokeaction"]
                    }
                ]
            },
            "setHigh": {
                "description": "Set a high intensity level",
                input: { type: 'string' },
                forms: [
                    {
                        href: "setHigh", 
                        response: { contentType: "application/json" },
                        mediaType: "application/json", 
                        op: ["invokeaction"]
                    }
                ]
            },
            "setMedium": {
                "description": "Set a medium intensity level",
                input: { type: 'string' },
                forms: [
                    {
                        href: "setMedium", 
                        response: { contentType: "application/json" },
                        mediaType: "application/json", 
                        op: ["invokeaction"]
                    }
                ]
            }
        }
    };

    constructor(servient: Servient, 
        init: WoT.ExposedThingInit, 
        environment : Museum) {

        super(servient, init, DimmableLamp.initBase, environment);

        this.setReadHandler('isOn');
        this.setReadHandler('intensity');
        this.setWriteHandler("intensity");

        // Define the "toggle" action to switch the lamp's state
        this.setActionHandler("toggle", async () => {
            eventQueue.enqueueEvent(async () => {
                this.isOn = !this.isOn;
            });
            return ok();
        });

        // Define the "setLow" action to switch the lamp's state
        this.setActionHandler("setLow", async () => {
            eventQueue.enqueueEvent(async () => {
                this.intensity = "low";
            });
            return ok();
        });

        // Define the "setHigh" action to switch the lamp's state
        this.setActionHandler("setHigh", async () => {
            eventQueue.enqueueEvent(async () => {
                this.intensity = "high";
            });
            return ok();
        });
        
        // Define the "setMedium" action to switch the lamp's state
        this.setActionHandler("setMedium", async () => {
            eventQueue.enqueueEvent(async () => {
                this.intensity = "medium";
            });
            return ok();
        });
        
    }

    // Calculate the power consumption based on the lamp's intensity.
    private calculatePower(): number {
        switch (this.intensity) {
            case "low": return 20; 
            case "medium": return 50; 
            case "high": return 100; 
            default: return 50;
        }
    }

    // Update the lamp's energy consumption in the environment.
    public update(deltaTime: number): void {
        if (this.isOn) {
            eventQueue.enqueueEvent(() => this.environment
                .updateEnergyConsumption(this.roomId, this.calculatePower()*(deltaTime)));
        }
        
    }
}

//Factory function to create a new LampThing instance.
export function create(servient: Servient, 
    init: WoT.ExposedThingInit, 
    environment : Museum): DimmableLamp {
return new DimmableLamp(servient, init, environment);
}