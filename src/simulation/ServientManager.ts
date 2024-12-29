import { Servient} from '@node-wot/core';
import { HttpServer } from '@node-wot/binding-http';
import { MqttBrokerServer } from '@node-wot/binding-mqtt';

/**
 * ServientManager handles the initialization and management of multiple servients.
 * Each servient is configured with an HTTP server on a unique port based on an incremental ID.
 */
class ServientManager {
    private servients: Map<any, Servient> = new Map();
    private isStart = false;

    public async initializeServients(servientsData: any): Promise<void> {
        if(!this.isStart) {
            for (const servConfig of servientsData) {
            
                const servient = new Servient();
                
                try {
    
                    switch(servConfig.type) {
                        case 'http':
                            // Add an HTTP server to each servient with a unique port
                            servient.addServer(new HttpServer(servConfig));
                            break;
                        case 'mqtt':
                            // Add an MQTT server to each servient
                            servient.addServer(new MqttBrokerServer(servConfig));
                            break;
    
                    } 
                    
                    this.servients.set(servConfig.id, servient);
                    
                    console.log(`Initialized ${servConfig.type} servient ${servConfig.id}`);
                } catch (error) {
                    console.error(`Failed to initialize servient ${servConfig.id}:`, error);
                    throw error;
                }
            }
        }

        this.isStart = true;
        
    }

    // Retrieves a servient by its ID.
    public getServient(id: any): Servient | undefined {
        return this.servients.get(id) || Array.from(this.getAllServients().values())[0];;
    }

    // Retrieves all servients.
    public getAllServients(): Map<number, Servient> {
        return this.servients;
    }

    // Retrieves all Servients, starts them and waits for all of them to complete their startup processes.
    public async start(): Promise<void> {
        try {
            const servientStatus = Array.from(this.getAllServients().values()).map(servient => servient.start());
            await Promise.all(servientStatus);
        } catch (error) {
            console.error("An error occurred while starting servients:", error);
            throw error; 
        }
    }
    
    // Shutdown all the servients
    public async shutdown(): Promise<void> {
        Array.from(this.getAllServients().values()).map(async (servient) => {
            try {
                Object.keys(servient.getThings()).forEach(async (key) => {
                    await servient.destroyThing(key); 
                });
            } catch (err) {
                console.error(`An error occurred while servients shutdown: `, err);
            }
        });
        
    }

}

export const servientManager = new ServientManager();