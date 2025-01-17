import Servient from "@node-wot/core";
import { Thing } from "../../Thing";
import { Room } from "./Room";

export class Museum extends Thing {

    private title : string = '';    //identifier of the room.
    private ambientTemperature ?: number;   // The external or surrounding temperature affecting the room, in degrees Celsius.
    private coolingConstant: number = 0;    // A constant that represents the room's cooling characteristics
    private humidityDecreaseRate: number = 0.01; // Rate at which humidity naturally decreases
    private static readonly humidityIncreasePerPerson: number = 0.05; // Percentage increase per person per second
    private static readonly specificHeatCapacity: number = 1005; // The specific heat capacity of air in Joules per kilogram per degree Celsius (J/kg°C).
    private static readonly airDensity: number = 1.225; // The density of air in kilograms per cubic meter (kg/m³), used for thermal calculations.

    private rooms : Map<string, Room> = new Map();

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
            "ambientTemperature": {
                "type": "number",
                "description": "The ambient (external) temperature that affects the environment's cooling",
                "observable": true,
                "readOnly": false,
                "writeOnly": false,
                "minimum": 0,
                "forms": [
                    {
                        "href": "ambientTemperature",
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
            "maxTemperature": {
                "description": "Emitted when the temperature is >30",
                "roomId": {
                    "type": "string",
                    "description": "the room id"
                },
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
                "roomId": {
                    "type": "string",
                    "description": "the room id"
                },
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
                "roomId": {
                    "type": "string",
                    "description": "the room id"
                },
                "forms": [
                    {
                        "href": "maxHumidity",
                        "op": ["subscribeevent"],
                        "contentType": "application/json"
                    }
                ]
            },
            "minHumidity": {
                "description": "Emitted when the humidity is <15%",
                "roomId": {
                    "type": "string",
                    "description": "the room id"
                },
                "forms": [
                    {
                        "href": "minHumidity",
                        "op": ["subscribeevent"],
                        "contentType": "application/json"
                    }
                ]
            }
        }
    };

    constructor(servient: Servient, init: WoT.ExposedThingInit) {

        super(servient, init, Museum.initBase);
        this.configureProperties(init);
        this.setPropertiesDefaultHandler(init);

        this.rooms = new Map();

        (init.rooms as any).forEach((roomInit: any) => {
            this.rooms.set(roomInit.id, new Room(roomInit.title, roomInit.volume, roomInit.temperature, roomInit.humidity));
            const roomId = roomInit.id;

            (Museum.initBase.properties as any)[`rooms/${roomId}/properties/temperature`] = {
                type: "number",
                description: `Temperature of room ${roomId}`,
                observable: true,
                readOnly: true,
                forms: [
                    {
                        href: `/museum/rooms/${roomId}/properties/temperature`,
                        op: ["readproperty", "observeproperty"],
                        contentType: "application/json"
                    }
                ]
            };

            (Museum.initBase.properties as any)[`rooms/${roomId}/properties/humidity`] = {
                type: "number",
                description: `Humidity of room ${roomId}`,
                observable: true,
                readOnly: true,
                forms: [
                    {
                        href: `/museum/rooms/${roomId}/properties/humidity`,
                        op: ["readproperty", "observeproperty"],
                        contentType: "application/json"
                    }
                ]
            };
            (Museum.initBase.properties as any)[`rooms/${roomId}/properties/volume`] = {
                type: "number",
                description: `Volume of room ${roomId}`,
                observable: true,
                readOnly: true,
                forms: [
                    {
                        href: `/museum/rooms/${roomId}/properties/volume`,
                        op: ["readproperty"],
                        contentType: "application/json"
                    }
                ]
            };
            (Museum.initBase.properties as any)[`rooms/${roomId}/properties/totalEnergyConsumption`] = {
                type: "number",
                description: `Total energy consumption of room ${roomId}`,
                observable: true,
                readOnly: false,
                forms: [
                    {
                        href: `/museum/rooms/${roomId}/properties/totalEnergyConsumption`,
                        op: ["readproperty", "writeproperty"],
                        contentType: "application/json"
                    }
                ]
            };
        });

    }

    public getTitle() : string {
        return this.title;
    }

    public getRooms() {
        return this.rooms;
    }

    // Adjusts the humidity based on the number of people in the room.
    private adjustHumidityFromPeople(roomId : string, deltaTime: number, people : number): void {
        const room = this.rooms.get(roomId);
        const humidity = room?.getHumidity();
        if (humidity) {
            const humidityIncrease = Museum.humidityIncreasePerPerson * people * (deltaTime / 1000);
            room?.increaseHumidity(humidityIncrease);
        }
    }

    // Increases the environment's temperature based on the input energy.
    public async increaseTemperature(roomId : string, energy: number): Promise<void> {
        const room = this.rooms.get(roomId);
        const temperature = room?.getTemperature();
        const volume = room?.getVolume();
        if (temperature && volume) {
            const mass = Museum.airDensity * volume;
            room?.updateTemperature(energy / (mass * Museum.specificHeatCapacity));
            room?.updateEnergyConsumption(energy);
        }
    }

    // Decreases the humidity by a given percentage.
    public async decreaseHumidity(roomId: string, energy: number): Promise<void> {
        const room = this.rooms.get(roomId);
        const humidity = room?.getHumidity();
        if (humidity) {
            room?.decreaseHumidity(energy * this.humidityDecreaseRate);
            room?.updateEnergyConsumption(energy);
        }
    }

    public update(deltaTime: number): void {

        for (const [id, room] of this.rooms.entries()) {
            // Update the room's temperature based on the ambient temperature and cooling rate
            const temp = room.getTemperature();
            if (this.ambientTemperature && temp) {
                const temperatureDifference = temp - this.ambientTemperature;
                const coolingRate = this.coolingConstant * temperatureDifference;
                room.updateTemperature(-(coolingRate * (deltaTime / 1000)));  
                const newTemp = room.getTemperature();
                if (newTemp && newTemp > 30) {
                    this.emitEvent('maxTemperature', id);
                } else if (newTemp && newTemp <= 18) {
                    this.emitEvent('minTemperature', id);
                }
            }

            // Update the room's humidity based on natural decrease and other factors
            const humidity = room.getHumidity();
            if (humidity) {
                const humidityDrop = this.humidityDecreaseRate * (deltaTime / 1000);
                room.decreaseHumidity(humidityDrop);
                //this.adjustHumidityFromPeople(deltaTime);
                const newHumidity = room.getHumidity();
                if (newHumidity && newHumidity > 55) {
                    this.emitEvent('maxHumidity', id);
                } else if (newHumidity && newHumidity < 15) {
                    this.emitEvent('minHumidity', id);
                }
            }
        }
    }

    // Updates the total energy consumption of the room.
    public async updateEnergyConsumption(roomId : string, energy: number): Promise<void> {
        this.rooms.get(roomId)?.updateEnergyConsumption(energy);
    }
}

//Factory function to create a new Room instance.
export function create(servient: Servient, 
    init: WoT.ExposedThingInit): Museum {

return new Museum(servient, init);
}
