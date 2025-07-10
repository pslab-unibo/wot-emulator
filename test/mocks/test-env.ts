import Servient from "@node-wot/core";
import { PeriodicSituatedThing, SituatedThing, Thing } from "../../src";
import { EventQueue } from "../../src/simulation/event-queue";

export class TestThing extends Thing{

    private static td: WoT.ExposedThingInit = {
        title: "TestThing",
        id: "test",
        properties: {
            test: {
                type: "string",
            }
        }
    }

    constructor(queue: EventQueue, servient: Servient) {
        super(queue, servient, TestThing.td);
    }

    public update(deltaTime: number): void {
        console.log("environment update: " + deltaTime);
    }

}

export class TestSituatedThing extends SituatedThing<TestThing> {

    public update(deltaTime: number): void {
        console.log("situated thing update: " + deltaTime);
    }
    
}

export class TestPeriodicSituatedThing extends PeriodicSituatedThing<TestThing> {

    public triggerPeriodicBehaviour(): void {
       console.log("periodic thing triggered");
    }
    
}