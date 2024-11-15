import { Scheduler } from "./simulation/scheduler";
import { initializeThings } from "./simulation/init";

// Instantiate the Scheduler
const scheduler = new Scheduler(100);

// Initialize Things by reading configuration and exposing them via the specified Servient
initializeThings(scheduler);

// Start the Scheduler to process events and periodic actions
scheduler.start();

