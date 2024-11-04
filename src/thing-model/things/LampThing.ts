import { ExposedThing, Servient } from "@node-wot/core";
import { ThingInterface } from "../ThingInterface";

export class LampThing extends ThingInterface {

    private intensity: number = 0;  // Brightness level of the lamp
    private isOn: boolean = false;  // Power state of the lamp (on/off)

    constructor(servient: Servient, init: WoT.ExposedThingInit, eventTickRate: number) {
        super(servient, init, eventTickRate);

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
            this.isOn = !this.isOn;  // Toggle the current state
            return undefined;
        });
    }

    // Method to simulate periodic behavior (tick event)
    public tickEvent(): void {
        if (this.isOn) {
            this.intensity += 1;
            if (this.intensity > 100) this.intensity = 100; 
            console.log(`Tick action for ${this.getThing().title}, intensity increased to: ${this.intensity}`);
        }
    }
}
