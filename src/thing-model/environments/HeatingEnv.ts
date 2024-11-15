import Servient from "@node-wot/core";
import { Thing } from "../Thing";

export class HeatingEnv extends Thing {

    private static readonly specificHeatCapacity = 1005; // J/kg°C (air capacity)
    private static readonly airDensity = 1.225; // kg/m³ (air density)

    private static initBase : WoT.ExposedThingInit = {
        "@context": "https://www.w3.org/2019/wot/td/v1",
        "@type": "Thing",
        "description": "An environment that can be heated or cooled based on external influences",
        "forms": [
            {
                "href": "environment",
                "op": ["readproperty", "writeproperty", "observeproperty"],
                "contentType": "application/json"
            }
        ],
        "properties": {
            "currentTemperature": {
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

    constructor(servient: Servient, init: WoT.ExposedThingInit, map : Map<string, any> =new Map<string, any>()) {
        super(servient, init, HeatingEnv.initBase, map);

        this.getThing().setPropertyReadHandler("currentTemperature", async () => {
            return this.properties.get("temperature");
        });
    }

    public async increaseTemperature(energy : number) : Promise<void> {
        const mass = HeatingEnv.airDensity * this.properties.get("volume");
        const deltaTemperature = energy / (mass * HeatingEnv.specificHeatCapacity);
        const temp : number = this.properties.get("temperature");
        this.properties.set("temperature", temp+deltaTemperature);
        console.log("updated temperature: ", this.properties.get("temperature"));
    } 

    protected update(deltaTime : number): void {
        const temperatureDifference = this.properties.get("temperature") - this.properties.get("ambientTemperature");
        const coolingRate = this.properties.get("coolingConstant") * temperatureDifference;

        const temperatureDrop = coolingRate * (deltaTime / 1000);  
       
        const temp : number = this.properties.get("temperature");
        this.properties.set("temperature", temp-temperatureDrop);
    }


}