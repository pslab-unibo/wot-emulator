import { Servient } from '@node-wot/core';
import { HttpServer } from '@node-wot/binding-http';

export class ServientManager {
    private servients: Map<number, Servient> = new Map();
    private readonly basePort: number = 8081;

    constructor(thingsData: Object) {
        this.initializeServients(thingsData);
    }

    private initializeServients(thingsData: Object): void {
        
        const maxServientId = this.getMaxServientId(thingsData);

        for (let id = 0; id <= maxServientId; id++) {
            const servient = new Servient();
            const port = this.basePort + id;
            
            try {
                servient.addServer(new HttpServer({ port }));
                this.servients.set(id, servient);
                servient.start();
                console.log(`Initialized servient ${id} on port ${port}`);
            } catch (error) {
                console.error(`Failed to initialize servient ${id}:`, error);
                throw error;
            }
        }
    }

    public async start(): Promise<void> {
        try {
            this.getAllServients().forEach((servient, key) => {
                servient.start();
            });
        } catch(error) {
            throw error;
        }
    }

    private getMaxServientId(thingsData: any): number {
        return thingsData.reduce((max : number, thing : any) => {
            return Math.max(max, thing.servient ?? 0);
        }, 0);
    }

    public getServient(id: number): Servient | undefined {
        return this.servients.get(id);
    }

    public getAllServients(): Map<number, Servient> {
        return this.servients;
    }
}