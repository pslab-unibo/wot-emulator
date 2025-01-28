export class Room {

    private title : string = '';    //identifier of the room.
    private volume: number = 0;     // The volume of the room in cubic meters (m³)
    private temperature?: number;   // The current internal temperature of the room, in degrees Celsius.
    private humidity?: number;      // The current humidity level of the room as a percentage (0-100).
    private people : number = 0;

    private totalEnergyConsumption: number = 0;  // The total energy consumption of devices and systems in the room, in kilowatts (kW).

    constructor(title: string, volume: number, temperature: number, humidity: number) {
        this.title = title;
        this.volume = volume;
        this.temperature = temperature;
        this.humidity = humidity;
    }

    // Returns the title of the room.
    public getTitle() : string {
        return this.title;
    }

    // Returns the volume of the room.
    public getVolume() : number {
        return this.volume;
    }

    // Returns the current temperature of the room.
    public getTemperature() {
        return this.temperature;
    }

    // Returns the current humidity of the room.
    public getHumidity() {
        return this.humidity;
    }

    public getPeople() {
        return this.people;
    }

    public increasePeople(total?: number) {
        total ? this.people+=total : this.people++;
    }

    public removePeople(total?: number) {
        (total && this.people - total > 0) ? this.people-=total : this.people--;
    }

    // Updates the temperature of the room by adding a delta value.
    public updateTemperature(deltaTemperature : number) {
        if (this.temperature) {
            this.temperature += deltaTemperature;
        }
    }

    // Increases the humidity level of the room by a delta value, ensuring it does not exceed 100%.
    public increaseHumidity(deltaHumidity : number) {
        if(this.humidity) {
            this.humidity = Math.min(100, this.humidity + deltaHumidity)
        }
    }

    // Decreases the humidity level of the room by a delta value, ensuring it does not drop below 0%.
    public decreaseHumidity(deltaHumidity : number) {
        if(this.humidity) {
            this.humidity = Math.max(0, this.humidity - deltaHumidity);
        }
    }

    // Updates the total energy consumption of the room.
    public async updateEnergyConsumption(energy: number): Promise<void> {
        this.totalEnergyConsumption += energy/1000;
    }

    // Converts the room object to a JSON string representation.
    public toString(): string {    
        return JSON.stringify(
            {
                title: this.getTitle(), 
                type: this.constructor.name, 
                ...Object.getOwnPropertyNames(this)
                    .filter(field => 
                        typeof (this as any)[field] !== 'function'
                    )
                    .reduce((obj: { [field: string]: any }, field) => { 
                        obj[field] = (this as any)[field];
                        return obj;
                    }, {})
            }
        );
    }
}
