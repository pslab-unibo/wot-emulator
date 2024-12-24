import Servient from "@node-wot/core";
import { SituatedThing } from "../../SituatedThing";
import { Room } from "../../environments/museum/Room";
import { eventQueue } from "../../../simulation/eventQueue";
import { ok } from "../../../utils/action-result";

//* Represents a humidifier that emits moisture to an environment when turned on.
class Humidifier extends SituatedThing<Room> {

    private isOn: boolean = false;
    private power: number = 0;

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
                environment: Room) {

        super(servient, init, Humidifier.initBase, environment);

        this.setActionHandler("toggle", async () => {
            eventQueue.enqueueEvent(async () => {
                this.isOn = !this.isOn;
                console.log(`Humidifier state toggled to: ${this.isOn}`);
            });
            return ok();
        });

        this.setPropertiesDefaultHandler(init);

        this.configureProperties(init);
        this.setReadHandler('isOn');
    }

    /* Updates the state of the humidifier based on the elapsed time.
       Emits moisture to the environment if the humidifier is turned on. */
    public update(deltaTime: number) {
        if (this.isOn) {
            eventQueue.enqueueEvent(() => this.environment
                .decreaseHumidity(this.power * deltaTime));
        }
    }
}

// Factory function to create a new Humidifier instance.
export function create(servient: Servient,
                       init: any,
                       environment: Room): Humidifier {
    return new Humidifier(servient, init, environment);
}
