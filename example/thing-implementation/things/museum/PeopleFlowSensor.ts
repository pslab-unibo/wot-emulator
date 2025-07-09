import Servient from "@node-wot/core";
import { Museum } from "../../environments/museum/Museum";
import { MuseumThing } from "./MuseumThing";

// Represents a sensor system that tracks people flow between rooms in a museum environment.
class PeopleFlowSensor extends MuseumThing {

    private people : number = 0;    // The current number of people in the room

    // Base structure of the sensor's TD
    private static initBase: WoT.ExposedThingInit = {
            description: "A humidifier that emits moisture",
            forms: [
                {
                    href: "things",
                    op: ["readproperty", "writeproperty", "observeproperty"],
                    contentType: "application/json"
                }
            ],
            properties: {
                people: {
                    type: "number",
                    description: "The current number of people in the room",
                    observable: false,
                    readOnly: true,
                    writeOnly: false,
                    forms: [
                        {
                            href: "people",
                            op: ["readproperty"],
                            contentType: "application/json"
                        }
                    ]
                }
            },
            events: {
                "peopleChanged": {
                    "description": "Emitted when the number of people in the room changes",
                    "roomId": {
                        "type": "string",
                        "description": "the room id"
                    },
                    "people": {
                        "type": "number",
                        "description": "current number of people in the room"
                    },
                    "forms": [
                        {
                            "href": "peopleChanged",
                            "op": ["subscribeevent"],
                            "contentType": "application/json"
                        }
                    ]
                }
            }
        };
    
    constructor(servient: Servient,
                init: WoT.ExposedThingInit,
                environment: Museum) {

        super(servient, init, PeopleFlowSensor.initBase, environment);

        this.setPropertiesDefaultHandler(init);
        this.configureProperties(init);
    }

    public update(deltaTime: number): void {
        // Get the current number of people in the room from the environment
        const people = this.environment.getPeople(this.roomId);

        // Check if the number of people has changed
        if (people && people !== this.people) {
            this.people = people;

            // Emit an event to notify about the change in the number of people in the room
            this.emitEvent("peopleChanged", {
                roomId: this.roomId,
                people: this.people,
            });
        }
    }
    
}

//Factory function to create a new PeopleFlowSensor instance.
export function create(servient: Servient, 
    init: WoT.ExposedThingInit, 
    environment: Museum): PeopleFlowSensor {
    return new PeopleFlowSensor(servient, init, environment);
}
