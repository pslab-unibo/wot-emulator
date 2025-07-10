import Servient from "@node-wot/core";
import { EventQueue } from "../simulation/event-queue";
import { Thing } from "./thing";

export {Thing} from "./thing";
export {SituatedThing} from "./situated-thing";
export {PeriodicSituatedThing} from "./periodic-situated-thing";

export interface ThingFactory {
    create(eventQueue : EventQueue, servient : Servient, environment?: Thing, data? : object): Thing; 
}

//TODO consider mixins for periodic and situated things ??