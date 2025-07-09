import { ServientConfiguration, ServientType } from './configuration';
import { Servient} from '@node-wot/core';
import { HttpConfig, HttpServer } from '@node-wot/binding-http';
import { MqttBrokerServer, MqttBrokerServerConfig } from '@node-wot/binding-mqtt';

/**
 * ServientManager handles the initialization and management of multiple servients.
 */
export class ServientManager {
    private servients: Map<string, Servient> = new Map();

    constructor(servients: ServientConfiguration[]) {
        servients.forEach(config => {
            const servient = new Servient();
            switch(config.type) {
                case ServientType.HTTP:
                    servient.addServer(new HttpServer(config.data as HttpConfig));
                    break;
                case ServientType.MQTT:
                    servient.addServer(new MqttBrokerServer(config.data as MqttBrokerServerConfig));
                    break;
            }      
            this.servients.set(config.id, servient);
        });
    }

    public async start() {
        await Promise.all(
            Array.from(this.servients.values())
                .map(async (servient) => { servient.start()})
        )
    }

    public async stop() {
        await Promise.all(
            Array.from(this.servients.values())
                .map(async (servient) => { servient.shutdown()})
        )
    }

    public getServient(id: string): Servient {
        let servient = this.servients.get(id)
        if(servient) {
            return servient;
        }
        throw new Error(`Servient with id ${id} not found`);
    }

}