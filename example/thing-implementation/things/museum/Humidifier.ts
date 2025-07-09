import Servient from "@node-wot/core";
import { eventQueue } from "../../../simulation/eventQueue";
import { ok } from "../../../../library/utils/action-result";
import { MuseumThing } from "./MuseumThing";
import { Museum } from "../../environments/museum/Museum";

class Humidifier extends MuseumThing {

    private isOn: boolean = false;  // Tracks if the humidifier is on or off
    private power: number = 0;      // Power level of the humidifier

    // Base structure of the humidifier's TD
    private static initBase: WoT.ExposedThingInit = {
        description: "A humidifier that emits moisture",
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
                description: "The fixed power level of the humidifier",
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
                description: "The current state of the humidifier (on/off)",
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
                description: "Turns the humidifier on or off",
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
                environment: Museum) {

        super(servient, init, Humidifier.initBase, environment);

        // Set up action handler for 'toggle' action, which turns the humidifier on or off
        this.setActionHandler("toggle", async () => {
            eventQueue.enqueueEvent(async () => {
                this.isOn = !this.isOn;
            });
            return ok();
        });

        this.setPropertiesDefaultHandler(init);
        this.configureProperties(init);
        this.setReadHandler('isOn');
    }

    /* 
       Updates the state of the humidifier based on the elapsed time (deltaTime).
       Emits moisture to the environment if the humidifier is turned on. 
    */
    public update(deltaTime: number) {
        if (this.isOn) {
            eventQueue.enqueueEvent(() => this.environment
                .decreaseHumidity(this.roomId, this.power * (deltaTime / 100)));
        }
    }
}

// Factory function to create a new Humidifier instance.
export function create(servient: Servient,
                       init: any,
                       environment: Museum): Humidifier {
    return new Humidifier(servient, init, environment);
}
