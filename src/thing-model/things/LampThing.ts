import { ExposedThing, Servient } from "@node-wot/core";
import { ThingInterface } from "../ThingInterface";

export class LampThing extends ThingInterface {

    private intensity: number = 0;
    private isOn: boolean = false;

    constructor(servient: Servient, init: WoT.ExposedThingInit, eventTickRate: number) {
        super(servient, init, eventTickRate);

        this.getThing().setPropertyReadHandler("intensity", async () => {
            return this.intensity;
        });
    
        this.getThing().setPropertyWriteHandler("intensity", async (newValue) => {
            if (typeof newValue === "number" && newValue >= 0 && newValue <= 100) {
                this.intensity = newValue;
                console.log(`Intensity updated to: ${this.intensity}`);
            } else {
                throw new Error("Invalid intensity value. Must be between 0 and 100.");
            }
        });

        this.getThing().setPropertyReadHandler("isOn", async () => {
            return this.isOn;
        });
    
        this.getThing().setPropertyWriteHandler("isOn", async (newValue) => {
            if (typeof newValue === "boolean") {
                this.isOn = newValue;
                console.log(`Change state in: ${this.isOn}`);
            } else {
                throw new Error("Invalid state value. Must be a boolean");
            }
        });

        this.thing.setActionHandler("toggle", async () => {
            if (this.isOn) {
                this.isOn = false;
            } else {
                this.isOn = true;
            } 
            return undefined;
        });
    }

    public tickEvent(): void {
        if (this.isOn) {
            this.intensity += 1;
            if (this.intensity > 100) this.intensity = 100; 
            console.log(`Tick action for ${this.getThing().title}, intensity increased to: ${this.intensity}`);
        }
    }
}
