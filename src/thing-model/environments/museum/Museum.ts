import { Thing } from "../../Thing";

export class Museum extends Thing {
    
    private volume : number = 0;
    private temperature ?: number;
    private humidity ?: number;

    public getTemperature(): number | undefined {
        return this.temperature;
    }

    public update(deltaTime: number): void {
    }
}