import Servient from "@node-wot/core";
import { Thing } from "../../Thing";

export class Room extends Thing {

    private title : string = '';    //identifier of the room.
    private volume: number = 0;     // The volume of the room in cubic meters (m³)
    private ambientTemperature ?: number;   // The external or surrounding temperature affecting the room, in degrees Celsius.
    private temperature?: number;   // The current internal temperature of the room, in degrees Celsius.
    private humidity?: number;      // The current humidity level of the room as a percentage (0-100).
    private coolingConstant: number = 0;    // A constant that represents the room's cooling characteristics
    private humidityDecreaseRate: number = 0.01; // Rate at which humidity naturally decreases
    private people: number = 0; // Number of people in the room

    private static readonly specificHeatCapacity: number = 1005; // The specific heat capacity of air in Joules per kilogram per degree Celsius (J/kg°C).
    private static readonly airDensity: number = 1.225; // The density of air in kilograms per cubic meter (kg/m³), used for thermal calculations.
    private static readonly humidityIncreasePerPerson: number = 0.05; // Percentage increase per person per second

    private totalEnergyConsumption: number = 0;  // // The total energy consumption of devices and systems in the room, in kilowatts (kW).

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
                "description": "The total energy consumption in the environment",
                "observable": true,
                "readOnly": false,
                "writeOnly": false,
                "forms": [
                    {
                        "href": "totalEnergyConsumption",
                        "op": ["readproperty", "writeproperty", "observeproperty"],
                        "contentType": "application/json"
                    }
                ]
            }
        },
        "actions": {
            "addPerson": {
                "description": "Add a person entering the room",
                "forms": [
                    {
                        "href": "addPerson",
                        "op": ["invokeaction"],
                        "contentType": "application/json"
                    }
                ]
            },
            "removePerson": {
                "description": "Remove a person leaving the room",
                "forms": [
                    {
                        "href": "removePerson",
                        "op": ["invokeaction"],
                        "contentType": "application/json"
                    }
                ]
            }
        },
        "events": {
            "peopleChanged": {
                "description": "Emitted when the number of people in the room changes",
                "data": {
                    "type": "number",
                    "description": "The updated number of people in the room"
                },
                "forms": [
                    {
                        "href": "peopleChanged",
                        "op": ["subscribeevent"],
                        "contentType": "application/json"
                    }
                ]
            },
            "maxTemperature": {
                "description": "Emitted when the temperature is >30",
                "forms": [
                    {
                        "href": "maxTemperature",
                        "op": ["subscribeevent"],
                        "contentType": "application/json"
                    }
                ]
            },
            "minTemperature": {
                "description": "Emitted when the temperature is <=18",
                "forms": [
                    {
                        "href": "minTemperature",
                        "op": ["subscribeevent"],
                        "contentType": "application/json"
                    }
                ]
            },
            "maxHumidity": {
                "description": "Emitted when the humidity is >55%",
                "forms": [
                    {
                        "href": "maxHumidity",
                        "op": ["subscribeevent"],
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

        this.setActionHandler("addPerson", async () => {
            this.emitEvent('peopleChanged', this.people+1);
            return this.people++; 
        });

        this.setActionHandler("removePerson", async () => {
            if (this.people > 0) {
                this.people--;
            };
            this.emitEvent('peopleChanged', this.people);
            return this.people;
        });
    }

    public getTitle() : string {
        return this.title;
    }

    // Adjusts the humidity based on the number of people in the room.
    private adjustHumidityFromPeople(deltaTime: number): void {
        if (this.humidity !== undefined) {
            const humidityIncrease = Room.humidityIncreasePerPerson * this.people * (deltaTime / 1000);
            this.humidity = Math.min(100, this.humidity + humidityIncrease); 
        }
    }

    // Increases the environment's temperature based on the input energy.
    public async increaseTemperature(energy: number): Promise<void> {
        if (this.temperature) {
            const mass = Room.airDensity * this.volume;
            const deltaTemperature = energy / (mass * Room.specificHeatCapacity);
            this.temperature += deltaTemperature;
            this.updateEnergyConsumption(energy);
        }
    }

    // Increases the humidity by a given percentage.
    public async increaseHumidity(amount: number): Promise<void> {
        if (this.humidity !== undefined) {
            this.humidity = Math.min(100, this.humidity + amount); 
        }
    }

    // Decreases the humidity by a given percentage.
    public async decreaseHumidity(amount: number): Promise<void> {
        if (this.humidity !== undefined) {
            this.humidity = Math.max(0, this.humidity - amount); // Cap at 0%
            this.updateEnergyConsumption(amount);
        }
    }

    public update(deltaTime: number): void {

        // Update the room's temperature based on the ambient temperature and cooling rate
        if (this.ambientTemperature && this.temperature) {
            const temperatureDifference = this.temperature - this.ambientTemperature;
            const coolingRate = this.coolingConstant * temperatureDifference;
            const temperatureDrop = coolingRate * (deltaTime / 1000);  
            this.temperature -= temperatureDrop;
            if (this.temperature > 30) {
                this.emitEvent('maxTemperature', null);
            } else if (this.temperature <= 18) {
                this.emitEvent('minTemperature', null);
            }
        }

        // Update the room's humidity based on natural decrease and other factors
        if (this.humidity !== undefined) {
            const humidityDrop = this.humidityDecreaseRate * (deltaTime / 1000);
            this.humidity = Math.max(0, this.humidity - humidityDrop);
            this.adjustHumidityFromPeople(deltaTime);
            if (this.humidity > 55) {
                this.emitEvent('maxHumidity', null);
            }
        }
    }

    // Updates the total energy consumption of the room.
    public async updateEnergyConsumption(energy: number): Promise<void> {
        this.totalEnergyConsumption += energy/1000;
    }
}

//Factory function to create a new Room instance.
export function create(servient: Servient, 
    init: WoT.ExposedThingInit): Room {

return new Room(servient, init);
}
