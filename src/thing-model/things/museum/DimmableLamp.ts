import Servient from "@node-wot/core";
import { SituatedThing } from "../../SituatedThing";
import { Room } from "../../environments/museum/Room";
import { eventQueue } from "../../../simulation/eventQueue";
import { ok } from "../../../utils/action-result";
import { MuseumThing } from "./MuseumThing";

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
            "setIntensity": {
                "description": "Set a new intensity level",
                forms: [
                    {
                        href: "setIntensity",  
                        op: ["invokeaction"]
                    }
                ]
            }
        }
    };

    constructor(servient: Servient, 
        init: WoT.ExposedThingInit, 
        environment : Room) {

        super(servient, init, DimmableLamp.initBase, environment);

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

        // Define the "toggle" action to switch the lamp's state
        this.setActionHandler("setIntensity", async (level) => {
            eventQueue.enqueueEvent(async () => {
                this.intensity = await level.value() as string;
                console.log(`Lamp intensity changed to: ${this.intensity}`);
            });
            return ok();
        });
    }

    private calculatePower(): number {
        switch (this.intensity) {
            case "low": return 20; 
            case "medium": return 50; 
            case "high": return 100; 
            default: return 50;
        }
    }

    public update(deltaTime: number): void {
        if (this.isOn) {
            eventQueue.enqueueEvent(() => this.environment
                .updateEnergyConsumption(this.calculatePower()*(deltaTime)));
        }
        
    }
}

//Factory function to create a new LampThing instance.
export function create(servient: Servient, 
    init: WoT.ExposedThingInit, 
    environment : Room): DimmableLamp {
return new DimmableLamp(servient, init, environment);
}