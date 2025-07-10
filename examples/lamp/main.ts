import { ServientType } from "../../src";
import { EventQueue } from "../../src/simulation/event-queue";
import { ServientManager } from "../../src/simulation/servient-manager";
import { Lamp } from "./lamp";

let queue : EventQueue = new EventQueue();
let servientManager = new ServientManager([
    {
        type: ServientType.HTTP,
        id: "servient1",
        data: {
            port: 3000
        }
    },
]);

let lamp = new Lamp(queue, servientManager.getServient("servient1"));

(async () => {
    await servientManager.start();
    await lamp.expose();
    console.log("Lamp is exposed and ready to use.");
})().catch((error) => {
    console.error("Error starting the lamp:", error);
});