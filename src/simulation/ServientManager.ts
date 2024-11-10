import { Servient } from '@node-wot/core';
import { HttpServer } from '@node-wot/binding-http';

/**
 * ServientManager handles the initialization and management of multiple servients.
 * Each servient is configured with an HTTP server on a unique port based on an incremental ID.
 */
export class ServientManager {
    private servients: Map<number, Servient> = new Map();
    private readonly basePort: number = 8081; // PARAM ??

    constructor(thingsData: Object) {
        this.initializeServients(thingsData);
    }

    private initializeServients(thingsData: Object): void {
        
        // Determine the maximum servient ID required from the things data
        const maxServientId = this.getMaxServientId(thingsData);

        for (let id = 0; id <= maxServientId; id++) {
            const servient = new Servient();
            const port = this.basePort + id;
            
            try {
                // Add an HTTP server to each servient with a unique port
                const server = new HttpServer({ "port":  port, "baseUri": `http://localhost:${port}/`});
                
                servient.addServer(server);
                this.servients.set(id, servient);

                // Start the servient
                servient.start();
                console.log(`Initialized servient ${id} on port ${port}`);
            } catch (error) {
                console.error(`Failed to initialize servient ${id}:`, error);
                throw error;
            }
        }
    }

    // Starts all servients in the servients map.
    // NOT USED
    public async start(): Promise<void> {
        try {
            this.getAllServients().forEach((servient, key) => {
                servient.start();
            });
        } catch(error) {
            throw error;
        }
    }

    // Determines the maximum servient ID needed based on the thingsData.
    private getMaxServientId(thingsData: any): number {
        return thingsData.reduce((max : number, thing : any) => {
            return Math.max(max, thing.servient ?? 0);
        }, 0);
    }

    // Retrieves a servient by its ID.
    public getServient(id: number): Servient | undefined {
        return this.servients.get(id);
    }

    // Retrieves all servients.
    public getAllServients(): Map<number, Servient> {
        return this.servients;
    }
}