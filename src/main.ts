// src/smart-lamp.ts

import { ExposedThing, Servient } from "@node-wot/core";
import { HttpServer } from "@node-wot/binding-http";
import { Scheduler } from "./simulation/scheduler";
import { LampThing } from "./thing-model/things/LampThing";

const servient = new Servient();
servient.addServer(new HttpServer({ port: 8081 })); 

servient.start().then(async (WoT) => {
    const lampThing = new LampThing(servient, {
        id: "urn:dev:wot:smart-lamp",
        title: "Smart Lamp",
        description: "A lamp that can be controlled via Web of Things",
        properties: {
            intensity: {
                type: "number",
                description: "The brightness level of the lamp (0-100)",
                observable: true,
                readOnly: false,
                writeOnly: false
            }
        },
        actions: {
            tick: {
                description: "Increases the lamp's intensity by 1"
            }
        },
        events: {
            overheated: {
                description: "Emits an event when the lamp overheats",
                data: { type: "string" }
            }
        }
    });

    console.log('lamp finish');
    await lampThing.getThing().expose();
    console.log("Smart Lamp Thing exposed at http://localhost:8081/things/smart-lamp");

    const scheduler = new Scheduler(2000); 
    scheduler.addThing(lampThing);
    scheduler.start();
});
