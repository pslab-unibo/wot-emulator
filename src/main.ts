import { inizializeServer } from "./simulation/server";

// Path to the main configuration file for the simulator, defining the setup for servients, environments, and things.
export const CONFIG = "./src/configuration/configMuseum.json";

// Path to the directory containing models for the various SituatedThings available in the simulation.
export const THING_MODEL = "../thing-implementation/things/museum/";

// Path to the directory containing models for the different environments used in the simulation.
export const ENV_MODEL = "../thing-implementation/environments/museum/";

inizializeServer();

        