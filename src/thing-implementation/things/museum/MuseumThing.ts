import Servient from "@node-wot/core";
import { Museum } from "../../environments/museum/Museum";
import { SituatedThing } from "../../SituatedThing";

// Define an abstract class that extends SituatedThing. This will serve as a base class for all things in the museum.
export abstract class MuseumThing extends SituatedThing<Museum> {

    // The ID of the room where the object is located
    protected roomId : string = '';
}