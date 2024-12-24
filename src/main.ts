import { Scheduler } from "./simulation/scheduler";
import { initialize } from "./simulation/init";
import { inizializeServer } from "./simulation/server";

// Path to the main configuration file for the simulator, defining the setup for servients, environments, and things.
export const CONFIG = "./src/td/configMuseum.json";

// Path to the directory containing models for the various SituatedThings available in the simulation.
export const THING_MODEL = "../thing-model/things/museum/";

// Path to the directory containing models for the different environments used in the simulation.
export const ENV_MODEL = "../thing-model/environments/museum/";

inizializeServer();

        