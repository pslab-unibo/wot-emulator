export class Room {

    private title : string = '';    //identifier of the room.
    private volume: number = 0;     // The volume of the room in cubic meters (m³)
    private temperature?: number;   // The current internal temperature of the room, in degrees Celsius.
    private humidity?: number;      // The current humidity level of the room as a percentage (0-100).

    private totalEnergyConsumption: number = 0;  // The total energy consumption of devices and systems in the room, in kilowatts (kW).

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
                "minimum": 0,
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
                "minimum": 0,
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
                "minimum": 0,
                "maximum": 100,
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
                "minimum": 0,
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
            },
            "minHumidity": {
                "description": "Emitted when the humidity is <15%",
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

    constructor(title: string, volume: number, temperature: number, humidity: number) {
        this.title = title;
        this.volume = volume;
        this.temperature = temperature;
        this.humidity = humidity;
    }

    public getTitle() : string {
        return this.title;
    }

    public getVolume() : number {
        return this.volume;
    }

    public getTemperature() {
        return this.temperature;
    }

    public getHumidity() {
        return this.humidity;
    }

    public updateTemperature(deltaTemperature : number) {
        if (this.temperature) {
            this.temperature += deltaTemperature;
        }
    }

    public increaseHumidity(deltaHumidity : number) {
        if(this.humidity) {
            this.humidity = Math.min(100, this.humidity + deltaHumidity)
        }
    }

    public decreaseHumidity(deltaHumidity : number) {
        if(this.humidity) {
            this.humidity = Math.max(0, this.humidity - deltaHumidity);
        }
    }

    // Updates the total energy consumption of the room.
    public async updateEnergyConsumption(energy: number): Promise<void> {
        this.totalEnergyConsumption += energy/1000;
    }
}
