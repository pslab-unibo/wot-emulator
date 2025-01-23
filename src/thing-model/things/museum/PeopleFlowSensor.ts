import Servient from "@node-wot/core";
import { Museum } from "../../environments/museum/Museum";
import { PeriodicThing } from "../../PeriodicThing";
import { eventQueue } from "../../../simulation/eventQueue";

class PeopleFlowSensors extends PeriodicThing<Museum> {

    private people : Map<string, number> = new Map();

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
                environment: Museum,
                period : number) {

        super(servient, init, PeopleFlowSensors.initBase, environment, period);

        this.setPropertiesDefaultHandler(init);
        this.configureProperties(init);

        for (const key of this.environment.getRooms().keys()) {
            this.people.set(key, 0);
        }
    }

    public update(deltaTime: number): void {
        const firstRoomId = Array.from(this.people.keys())[0];
        const peopleInFirstRoom = Array.from(this.people.values())[0];
        
        const chanceToAddPeople = Math.random() * deltaTime;
        if (chanceToAddPeople > 0.8) {
            this.people.set(firstRoomId, peopleInFirstRoom + 1);
            this.emitEvent("peopleChanged", {
                roomId: firstRoomId,
                people: this.people.get(firstRoomId),
            });
        }
    
        const rooms = Array.from(this.environment.getRooms().keys());
        for (let i = 0; i < rooms.length; i++) {
            const currentRoomId = rooms[i];
            const isLastRoom = i === rooms.length - 1;
    
            const peopleInCurrentRoom = this.people.get(currentRoomId) || 0;
    
            if (peopleInCurrentRoom > 0) {
                const peopleToMove = Math.floor(Math.random() * Math.min(Math.ceil(peopleInCurrentRoom / 2), peopleInCurrentRoom));
    
                if (peopleToMove > 0) {
                    if (isLastRoom) {
                        // Remove people in the last room
                        this.people.set(currentRoomId, peopleInCurrentRoom - peopleToMove);
    
                        this.emitEvent("peopleChanged", {
                            roomId: currentRoomId,
                            people: this.people.get(currentRoomId),
                        });
                    } else {
                        const nextRoomId = rooms[i + 1];
                        if (nextRoomId) {
                            this.people.set(currentRoomId, peopleInCurrentRoom - peopleToMove);
                            const peopleInNextRoom = this.people.get(nextRoomId) || 0;
                            this.people.set(nextRoomId, peopleInNextRoom + peopleToMove);
    
                            this.emitEvent("peopleChanged", {
                                roomId: currentRoomId,
                                people: this.people.get(currentRoomId),
                            });
    
                            this.emitEvent("peopleChanged", {
                                roomId: nextRoomId,
                                people: this.people.get(nextRoomId),
                            });
                        }
                    }
                }
            }

            eventQueue.enqueueEvent(async () => this.environment.adjustHumidityFromPeople(this.people, deltaTime));
        }
    }
    

    public toString(): string {
        return JSON.stringify(
            {
                title: this.getTitle(), 
                type: this.constructor.name, 
                ...Array.from(this.people.entries()).reduce((roomsObj, [room, peopleCount]) => {
                    roomsObj[room] = peopleCount;
                    return roomsObj;
                }, {} as Record<string, number>)
            }
        );
    }
    
}
//Factory function to create a new PeopleFlowSensor instance.
export function create(servient: Servient, 
    init: WoT.ExposedThingInit, 
    environment: Museum, 
    period: number): PeopleFlowSensors {
    return new PeopleFlowSensors(servient, init, environment, period);
}
