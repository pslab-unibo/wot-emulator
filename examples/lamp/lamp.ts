import {Servient}  from "@node-wot/core";
import { Thing } from "../../src";
import { EventQueue } from "../../src/simulation/event-queue";
import { Property } from "../../src/thing-models/thing";

export class Lamp extends Thing {

    private static td : WoT.ExposedThingInit = {
        "@context": "https://www.w3.org/2019/wot/td/v1",
        id: "my-lamp-1",
        title: "Lamp1",
        properties: {
            state: {
                type: "boolean",
                title: "Lamp State",
                description: "The state of the lamp (on/off)",
                observable: false,
                readOnly: false
            },
            brightness: {
                type: "number",
                title: "Lamp Brightness",
                description: "The brightness of the lamp (0-100)",
                observable: true,
                readOnly: false,
                minimum: 0,
                maximum: 100,
                multipleOf: 1
            }
        },
        actions: {
            toggle: {
                title: "Toggle Lamp State",
                description: "Toggle the state of the lamp"
            }
        }
    }

    constructor(queue: EventQueue, servient: Servient) {
        const state = new Map<string, Property<any>>([
            ["state", new Property<boolean>(false)],
            ["brightness", new Property<number>(0)]
        ])
        super(queue, servient, Lamp.td, state);
    }

    public update(deltaTime: number): void {
        throw new Error("Method not implemented.");
    }
}