import Servient from "@node-wot/core";
import { SituatedThing } from "../../SituatedThing";
import { Museum } from "./Museum";
import { Thing } from "../../Thing";

export class Room extends Thing {
    private volume: number = 0;
    private ambientTemperature ?: number;
    private temperature?: number;
    private humidity?: number;
    private coolingConstant: number = 0;
    private humidityDecreaseRate: number = 0.01; // Rate at which humidity naturally decreases
    private people: number = 0; // Number of people in the room

    private static readonly specificHeatCapacity: number = 1005; // J/kg°C (air capacity)
    private static readonly airDensity: number = 1.225; // kg/m³ (air density)
    private static readonly humidityIncreasePerPerson: number = 0.05; // Percentage increase per person per second

    private totalEnergyConsumption: number = 0;  // kW

    private static initBase: WoT.ExposedThingInit = {
        "@context": "https://www.w3.org/2019/wot/td/v1",
        "@type": "Environment",
        "description": "An environment that can be heated, cooled, or humidified based on external influences",
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
            "humidity": {
                "type": "number",
                "description": "The current humidity of the environment (percentage)",
                "observable": true,
                "readOnly": true,
                "writeOnly": false,
                "forms": [
                    {
                        "href": "currentHumidity",
                        "op": ["readproperty", "observeproperty"],
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
            },
            "people": {
                "type": "number",
                "description": "The number of people in the environment",
                "observable": true,
                "readOnly": false,
                "writeOnly": false,
                "forms": [
                    {
                        "href": "people",
                        "op": ["readproperty", "writeproperty", "observeproperty"],
                        "contentType": "application/json"
                    }
                ]
            },
            "totalEnergyConsumption": {
                "type": "number",
                "description": "The number of energy consuption in the environment",
                "observable": true,
                "readOnly": false,
                "writeOnly": false,
                "forms": [
                    {
                        "href": "people",
                        "op": ["readproperty", "writeproperty", "observeproperty"],
                        "contentType": "application/json"
                    }
                ]
            }
        }
    };

    constructor(servient: Servient, init: WoT.ExposedThingInit) {
        super(servient, init, Room.initBase);

        this.configureProperties(init);
        this.setPropertiesDefaultHandler(init);
    }

    // Adjusts the humidity based on the number of people in the room.
    private adjustHumidityFromPeople(deltaTime: number): void {
        if (this.humidity !== undefined) {
            const humidityIncrease = Room.humidityIncreasePerPerson * this.people * (deltaTime / 1000);
            this.humidity = Math.min(100, this.humidity + humidityIncrease); // Cap at 100%
            //console.log("Humidity adjusted due to people: ", this.humidity);
        }
    }

    // Increases the environment's temperature based on the input energy.
    public async increaseTemperature(energy: number): Promise<void> {
        if (this.temperature) {
            const mass = Room.airDensity * this.volume;
            const deltaTemperature = energy / (mass * Room.specificHeatCapacity);
            this.temperature += deltaTemperature;
            this.updateEnergyConsumption(energy);
            //console.log("Updated temperature: ", this.temperature);
        }
    }

    // Increases the humidity by a given percentage.
    public async increaseHumidity(amount: number): Promise<void> {
        if (this.humidity !== undefined) {
            this.humidity = Math.min(100, this.humidity + amount); // Cap at 100%
            //console.log("Updated humidity: ", this.humidity);
        }
    }

    // Decreases the humidity by a given percentage.
    public async decreaseHumidity(amount: number): Promise<void> {
        if (this.humidity !== undefined) {
            this.humidity = Math.max(0, this.humidity - amount); // Cap at 0%
            this.updateEnergyConsumption(amount);
            //console.log("Updated humidity: ", this.humidity);
        }
    }

    public update(deltaTime: number): void {
        if (this.ambientTemperature && this.temperature) {
            const temperatureDifference = this.temperature - this.ambientTemperature;
            const coolingRate = this.coolingConstant * temperatureDifference;
            const temperatureDrop = coolingRate * (deltaTime / 1000);  
            this.temperature -= temperatureDrop;
        }

        if (this.humidity !== undefined) {
            const humidityDrop = this.humidityDecreaseRate * (deltaTime / 1000);
            this.humidity = Math.max(0, this.humidity - humidityDrop);
            this.adjustHumidityFromPeople(deltaTime);
        }
    }

    public async updateEnergyConsumption(energy: number): Promise<void> {
        this.totalEnergyConsumption += energy/1000;
    }
}

//Factory function to create a new Room instance.
export function create(servient: Servient, 
    init: WoT.ExposedThingInit): Room {

return new Room(servient, init);
}
