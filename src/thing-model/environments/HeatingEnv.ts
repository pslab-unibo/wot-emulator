import Servient from "@node-wot/core";
import { Thing } from "../Thing";

export class HeatingEnv extends Thing {
    private temperature : number = 20;
    private volume: number;
    private ambientTemperature: number; 
    private coolingConstant: number = 0.1;  

    private static readonly specificHeatCapacity = 1005; // J/kg°C (air capacity)
    private static readonly airDensity = 1.225; // kg/m³ (air density)

    private static initBase = {

    };

    constructor(servient: Servient, init: WoT.ExposedThingInit, volume : number, ambientTemperature: number, initialTemperature? : number, coolingConstant?: number) {
        super(servient, init);
        this.volume = volume;
        this.ambientTemperature = ambientTemperature;
        if(coolingConstant) {
            this.coolingConstant = coolingConstant;
        }
        if(initialTemperature) {
            this.temperature = initialTemperature;
        }

        this.getThing().setPropertyReadHandler("currentTemperature", async () => {
            return this.temperature;
        });
    }

    public async increaseTemperature(energy : number) : Promise<void> {
        const mass = HeatingEnv.airDensity * this.volume;
        const deltaTemperature = energy / (mass * HeatingEnv.specificHeatCapacity);
        this.temperature += deltaTemperature;
        console.log("updated temperature: ", this.temperature);
    } 

    protected update(deltaTime : number): void {
        const temperatureDifference = this.temperature - this.ambientTemperature;
        const coolingRate = this.coolingConstant * temperatureDifference;

        const temperatureDrop = coolingRate * (deltaTime / 1000);  
        this.temperature -= temperatureDrop;
    }


}