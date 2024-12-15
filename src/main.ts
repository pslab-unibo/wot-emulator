import { Scheduler } from "./simulation/scheduler";
import { initialize } from "./simulation/init";
import { inizializeServer } from "./simulation/server";

// Path to the main configuration file for the simulator, defining the setup for servients, environments, and things.
export const CONFIG = "./src/td/config.json";

// Path to the directory containing models for the various SituatedThings available in the simulation.
export const THING_MODEL = "../thing-model/things/";

// Path to the directory containing models for the different environments used in the simulation.
export const ENV_MODEL = "../thing-model/environments/";


// Instantiate the Scheduler
const scheduler = new Scheduler(100);
inizializeServer(scheduler);

/**
 * Initialize Things, Environment and Servients by reading  
 * configuration and exposing them via the specified Servient
 **/
initialize(scheduler).then(() => {
    // Start the Scheduler to process events and periodic actions
    scheduler.start();
});

        