import { HttpConfig } from "@node-wot/binding-http";
import { MqttBrokerServerConfig } from "@node-wot/binding-mqtt";

export enum ServientType {
    MQTT = "mqtt",
    HTTP = "http"
}

export type ServientConfiguration = {
    type: ServientType;    // Type of the servient (e.g., HTTP, MQTT)
    id: string;            // Servient ID
    data: HttpConfig | MqttBrokerServerConfig;
}

export type EnvironmentConfiguration = {
    title: string;         // Title of the Thing
    type: string;          // name of the file with the environment factory
    data?: object
    servient: string;
}

export type ThingConfiguration = {
    title: string;         // Title of the Thing
    type: string;          // name of the file with the thing factory
    situated?: boolean;     // Indicates if the Thing is situated in an environment
    data?: object
    servient: string;
}

export type Configuration = {
    thingFolder? : string; // path to the folder containing Thing models
    envFolder? : string; // path to the folder containing Environment models
    period: number; // Period for the emulator in ms
    servients : ServientConfiguration[];
    environment: EnvironmentConfiguration;    
    things: ThingConfiguration[];
}