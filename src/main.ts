import { Servient } from "@node-wot/core";
import { HttpServer } from "@node-wot/binding-http";
import { Scheduler } from "./simulation/scheduler";
import { startCommandListener } from "./command/commandListener";
import { initializeThings } from "./simulation/init";

// Create a new WoT servient to manage and expose Things
const servient = new Servient();
servient.addServer(new HttpServer({ port: 8081 }));

// Instantiate the Scheduler
const scheduler = new Scheduler(100);

// Start listening for external commands through the command listener
startCommandListener(scheduler);

servient.start().then(async () => {

    // Initialize Things by reading configuration and exposing them
    await initializeThings(servient, scheduler);

    // Start the Scheduler to process events and periodic actions
    scheduler.start();
});
