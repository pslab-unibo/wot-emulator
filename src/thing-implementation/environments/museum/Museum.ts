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

    private rooms : Map<string, Room> = new Map(); // A collection of rooms within the museum.

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
        const room = new Map();

        // Create and configure rooms from the initialization properties.
        (init.rooms as any).forEach((roomInit: any) => {
            room.set(roomInit.id, new Room(roomInit.title, roomInit.volume, roomInit.temperature, roomInit.humidity));
            const roomId = roomInit.id;

            // Add temperature, humidity, and volume properties for each room to the WoT configuration.
            (Museum.initBase.properties as any)[`${roomId}-temperature`] = {
                type: "number",
                description: `Temperature of room ${roomId}`,
                observable: true,
                readOnly: true,
                forms: [
                    {
                        href: `${roomId}-temperature`,
                        op: ["readproperty", "observeproperty"],
                        contentType: "application/json"
                    }
                ]
            };

            (Museum.initBase.properties as any)[`${roomId}-humidity`] = {
                type: "number",
                description: `Humidity of room ${roomId}`,
                observable: true,
                readOnly: true,
                forms: [
                    {
                        href: `${roomId}-humidity`,
                        op: ["readproperty", "observeproperty"],
                        contentType: "application/json"
                    }
                ]
            };

            (Museum.initBase.properties as any)[`${roomId}-volume`] = {
                type: "number",
                description: `Volume of room ${roomId}`,
                observable: true,
                readOnly: true,
                forms: [
                    {
                        href: `${roomId}-volume`,
                        op: ["readproperty"],
                        contentType: "application/json"
                    }
                ]
            };

            (Museum.initBase.properties as any)[`${roomId}-people`] = {
                type: "number",
                description: `Current people in the room ${roomId}`,
                observable: true,
                readOnly: true,
                forms: [
                    {
                        href: `${roomId}-people`,
                        op: ["readproperty"],
                        contentType: "application/json"
                    }
                ]
            };
        });

        super(servient, init, Museum.initBase);
        
        this.configureProperties(init);
        this.setPropertiesDefaultHandler(init);

        this.rooms = new Map(room);

        for (const roomId of this.rooms.keys()) {
            const url1 = roomId + '-temperature';
            this.setReadHandler(url1, async () => {
                const temperature = this.rooms.get(roomId)?.getTemperature();
                if (temperature === undefined) {
                    throw new Error("Temperature not available");
                }
                return temperature; 
            });

            const url2 = roomId + "-humidity";
            this.setReadHandler(url2, async () => {
                const temperature = this.rooms.get(roomId)?.getHumidity();
                if (temperature === undefined) {
                    throw new Error("Temperature not available");
                }
                return temperature; 
            });

            const url3 = roomId + "-volume";
            this.setReadHandler(url3, async () => {
                const temperature = this.rooms.get(roomId)?.getVolume();
                if (temperature === undefined) {
                    throw new Error("Temperature not available");
                }
                return temperature; 
            });
        }
    }

    // Return museum title
    public getTitle() : string {
        return this.title;
    }

    // Return the collection of rooms
    public getRooms() {
        return this.rooms;
    }

    public getPeople(room : string) {
        return this.rooms.get(room)?.getPeople();
    }

    // Adjusts the humidity based on the number of people in each room.
    public adjustHumidityFromPeople(room : Room, deltaTime: number): void {
        const humidity = room?.getHumidity();
        if (humidity) {
            const humidityIncrease = Museum.humidityIncreasePerPerson * room.getPeople() * (deltaTime / 1000);
            room?.increaseHumidity(humidityIncrease);
        }
    }

    // Increases the room's temperature based on the input energy.
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

    // Decreases the room's humidity by a given percentage.
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
                const newHumidity = room.getHumidity();
                if (newHumidity && newHumidity > 55) {
                    this.emitEvent('maxHumidity', id);
                } else if (newHumidity && newHumidity < 15) {
                    this.emitEvent('minHumidity', id);
                }

                this.adjustHumidityFromPeople(room, deltaTime);
            }
        }

        const firstRoomId = Array.from(this.rooms.keys())[0];
        const peopleInFirstRoom = this.rooms.get(firstRoomId)?.getPeople();
        
        // Randomly add people to the first room with a probability influenced by deltaTime.
        const chanceToAddPeople = Math.random() * deltaTime;
        if (chanceToAddPeople > 0.8) {
            this.rooms.get(firstRoomId)?.increasePeople();
        }
        
         // Handle people movement between adjacent rooms.
        const rooms = Array.from(this.getRooms().keys());
        for (let i = 0; i < rooms.length; i++) {
            const currentRoomId = rooms[i];
            const isLastRoom = i === rooms.length - 1;
    
            const peopleInCurrentRoom = this.rooms.get(currentRoomId)?.getPeople() || 0;
    
            if (peopleInCurrentRoom > 0) {
                const peopleToMove = Math.floor(Math.random() * Math.min(Math.ceil(peopleInCurrentRoom / 2), peopleInCurrentRoom));
    
                if (peopleToMove > 0) {
                    if (isLastRoom) {
                        // If it's the last room, just reduce the number of people in it.
                        this.rooms.get(currentRoomId)?.removePeople(peopleToMove);
                    } else {
                        // Move people from the current room to the next room.
                        const nextRoomId = rooms[i + 1];
                        if (nextRoomId) {
                            this.rooms.get(currentRoomId)?.removePeople(peopleToMove);
                            this.rooms.get(nextRoomId)?.increasePeople(peopleToMove);
                        }
                    }
                }
            }
        }
    }

    // Updates the total energy consumption of the room.
    public async updateEnergyConsumption(roomId : string, energy: number): Promise<void> {
        this.rooms.get(roomId)?.updateEnergyConsumption(energy);
    }

    // Converts the room object to a JSON string representation.
    public toString(): string {
        const excludeFields = ['environment', 'initBase', 'thing', 'lastUpdateTime'];
    
        const museumJson = {
            title: this.getTitle(),
            type: this.constructor.name,
            ...Object.getOwnPropertyNames(this)
                .filter(field =>
                    typeof (this as any)[field] !== 'function' &&
                    !excludeFields.includes(field) &&
                    field !== 'rooms'
                )
                .reduce((obj: { [field: string]: any }, field) => {
                    obj[field] = (this as any)[field];
                    return obj;
                }, {})
        };
    
        const roomsJson = Array.from(this.rooms.entries()).map(([id, room]) => ({
            id,
            ...(typeof room.toString === 'function' ? JSON.parse(room.toString()) : null)
        }));

        const combinedJson = {
            ...museumJson,  
            rooms: roomsJson 
        };
    
        const jsonString = JSON.stringify(combinedJson, null, 2);
        return jsonString;
    }
    
    
}

//Factory function to create a new Room instance.
export function create(servient: Servient, 
    init: WoT.ExposedThingInit): Museum {

return new Museum(servient, init);
}


