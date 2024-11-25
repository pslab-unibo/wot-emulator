import { Servient, ProtocolServer } from '@node-wot/core';
import { HttpServer } from '@node-wot/binding-http';
import { WebSocketServer } from '@node-wot/binding-websockets';
import { MqttBrokerServer } from '@node-wot/binding-mqtt';

/**
 * ServientManager handles the initialization and management of multiple servients.
 * Each servient is configured with an HTTP server on a unique port based on an incremental ID.
 */
export class ServientManager {
    private servients: Map<any, Servient> = new Map();

    constructor(servientsData: any) {
        this.initializeServients(servientsData);
    }

    private async initializeServients(servientsData: any): Promise<void> {

        for (const servConfig of servientsData) {
            
            const servient = new Servient();
            
            try {

                switch(servConfig.type) {
                    case 'http':
                        // Add an HTTP server to each servient with a unique port
                        servient.addServer(new HttpServer(servConfig));
                        break;
                    case 'mqtt':
                        servient.addServer(new MqttBrokerServer(servConfig));
                        break;

                } 
                
                this.servients.set(servConfig.id, servient);

                // Start the servient
                servient.start();
                
                console.log(`Initialized servient ${servConfig.id} on port ${servConfig.port}`);
            } catch (error) {
                console.error(`Failed to initialize servient ${servConfig.id}:`, error);
                throw error;
            }
        }
    }

    // Starts all servients in the servients map.
    //NOT USED
    public async start(): Promise<void> {
        try {
            this.getAllServients().forEach((servient, key) => {
                servient.start();
            });
        } catch(error) {
            throw error;
        }
    }

    // Retrieves a servient by its ID.
    public getServient(id: any): Servient | undefined {
        return this.servients.get(id) || Array.from(this.getAllServients().values())[0];;
    }

    // Retrieves all servients.
    public getAllServients(): Map<number, Servient> {
        return this.servients;
    }
}