import { Scheduler } from "./simulation/scheduler";
import { startCommandListener } from "./command/commandListener";
import { initializeThings } from "./simulation/init";

// Instantiate the Scheduler
const scheduler = new Scheduler(100);

// Start listening for external commands through the command listener
startCommandListener(scheduler);

// Initialize Things by reading configuration and exposing them via the specified Servient
initializeThings(scheduler);

// Start the Scheduler to process events and periodic actions
scheduler.start();

