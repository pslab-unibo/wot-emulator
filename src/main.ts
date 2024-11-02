import { Servient } from "@node-wot/core";
import { HttpServer } from "@node-wot/binding-http";
import { Scheduler } from "./simulation/scheduler";
import { startCommandListener } from "./command/commandListener";
import { initializeThings } from "./init";

const servient = new Servient();
servient.addServer(new HttpServer({ port: 8081 }));

const scheduler = new Scheduler(100);

startCommandListener();

servient.start().then(async () => {
    await initializeThings(servient, scheduler);
    scheduler.start();
});
