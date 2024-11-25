import Servient from "@node-wot/core";
import { Thing } from "../Thing";

/**
 * The `HeatingEnv` class represents a simulated environment that can be heated or cooled
 * based on external factors. It extends the base `Thing` class.
 */
export class HeatingEnv extends Thing {

    private volume : number = 30;
    private ambientTemperature : number = 18;
    private temperature : number = 0;
    private coolingConstant : number = 0.1;

    private static readonly specificHeatCapacity : number = 1005; // J/kg°C (air capacity)
    private static readonly airDensity : number = 1.225; // kg/m³ (air density)

    private static initBase : WoT.ExposedThingInit = {
        "@context": "https://www.w3.org/2019/wot/td/v1",
        "@type": "Environment",
        "description": "An environment that can be heated or cooled based on external influences",
        "forms": [
            {
                "href": "environment",
                "op": ["readproperty", "writeproperty", "observeproperty"],
                "contentType": "application/json"
            }
        ],
        "properties": {
            "temperature": {
                "type": "number",
                "description": "The current temperature of the environment",
                "observable": true,
                "readOnly": true,
                "writeOnly": false,
                "forms": [
                    {
                        "href": "currentTemperature",
                        "op": ["readproperty", "observeproperty"],
                        "contentType": "application/json"
                    }
                ]
            },
            "ambientTemperature": {
                "type": "number",
                "description": "The ambient (external) temperature that affects the environment's cooling",
                "observable": true,
                "readOnly": false,
                "writeOnly": false,
                "forms": [
                    {
                        "href": "ambientTemperature",
                        "op": ["readproperty", "writeproperty", "observeproperty"],
                        "contentType": "application/json"
                    }
                ]
            },
            "volume": {
                "type": "number",
                "description": "The volume of the environment in cubic meters",
                "observable": true,
                "readOnly": false,
                "writeOnly": false,
                "forms": [
                    {
                        "href": "volume",
                        "op": ["readproperty", "writeproperty", "observeproperty"],
                        "contentType": "application/json"
                    }
                ]
            },
            "coolingConstant": {
                "type": "number",
                "description": "The cooling constant, representing how quickly the environment cools down",
                "observable": true,
                "readOnly": false,
                "writeOnly": false,
                "forms": [
                    {
                        "href": "coolingConstant",
                        "op": ["readproperty", "writeproperty", "observeproperty"],
                        "contentType": "application/json"
                    }
                ]
            }
        },
        "events": {
            "increase": {
                "description": "Event triggered when the environment's temperature increases due to heat input over a period.",
                "data": {
                    "energy": {
                        "type": "number",
                        "description": "TThe heat power applied to the environment (in watts), multiplied by deltaTime."
                    }
                },
                "forms": [
                    {
                        "href": "increase",
                        "op": ["subscribeevent"]
                    }
                ]
            }
        }
    };

    constructor(servient: Servient, 
                init: WoT.ExposedThingInit) {

        super(servient, init, HeatingEnv.initBase);

        this.configureProperties(init);
    }

    //Increases the environment's temperature based on the input energy.
    public async increaseTemperature(energy : number) : Promise<void> {
        const mass = HeatingEnv.airDensity * this.volume;
        const deltaTemperature = energy / (mass * HeatingEnv.specificHeatCapacity);
        this.temperature += deltaTemperature;
        console.log("Updated temperature: ", this.temperature);
    } 

    //Updates the environment's temperature over time, simulating natural cooling.
    public update(deltaTime : number): void {
        const temperatureDifference = this.temperature - this.ambientTemperature;
        const coolingRate = this.coolingConstant * temperatureDifference;
        const temperatureDrop = coolingRate * (deltaTime / 1000);  
        this.temperature -= temperatureDrop;
    }


}

//Factory function to create a new HeatingEnv instance.
export function create(servient: Servient, 
        init: WoT.ExposedThingInit): HeatingEnv {

    return new HeatingEnv(servient, init);
}