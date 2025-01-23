export class Room {

    private title : string = '';    //identifier of the room.
    private volume: number = 0;     // The volume of the room in cubic meters (m³)
    private temperature?: number;   // The current internal temperature of the room, in degrees Celsius.
    private humidity?: number;      // The current humidity level of the room as a percentage (0-100).

    private totalEnergyConsumption: number = 0;  // The total energy consumption of devices and systems in the room, in kilowatts (kW).

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
