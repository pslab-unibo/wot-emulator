import { EventQueue } from "../src/simulation/event-queue";
import { TestThing } from "./mocks/test-env";
import { ServientManager } from "../src/simulation/servient-manager";
import { ServientType } from "../src";

const config = [
    {
        type: ServientType.HTTP,
        id: "servient1",
        data: {
            port: 3000
        }
    }
]

test("create thing", () => {
    let queue: EventQueue = new EventQueue();
    let servientManager: ServientManager = new ServientManager(config)
    let servient = servientManager.getServient("servient1");
    let thing = new TestThing(new EventQueue(), servient);

    expect(thing).toBeDefined();
    expect(thing.getTitle()).toBe("TestThing");

})

test("create and expose thing", async () => {
    let queue: EventQueue = new EventQueue();
    let servientManager: ServientManager = new ServientManager(config)
    let servient = servientManager.getServient("servient1");
    let environment: TestThing = new TestThing(queue, servient)
    await environment.expose();
    let thing = servientManager.getServient("servient1").getThing("test")
    expect(thing).toBeDefined();
})