import { ServientManager } from "../src/simulation/servient-manager";
import { ServientType } from "../src";
import { HttpServer } from "@node-wot/binding-http";
import { MqttBrokerServer } from "@node-wot/binding-mqtt";

const config = [
    {
        type: ServientType.HTTP,
        id: "servient1",
        data: {
            port: 3000
        }
    }
]

const config2 = [
    {
        type: ServientType.MQTT,
        id: "servient2",
        data: {
            port: 3000
        }
    }
]

test("create http servient", () => {
    let servientManager: ServientManager = new ServientManager(config)
    let servient = servientManager.getServient("servient1")
    expect(servient).toBeDefined();
    expect(servient.getServers().length).toBe(1);
    expect(servient.getServers()[0]).toBeInstanceOf(HttpServer)
})

test("create mqtt servient", () => {
    let servientManager: ServientManager = new ServientManager(config2)
    let servient = servientManager.getServient("servient2")
    expect(servient).toBeDefined();
    expect(servient.getServers().length).toBe(1);
    expect(servient.getServers()[0]).toBeInstanceOf(MqttBrokerServer)
})



test("create multiple servients", () => {
    let servientManager: ServientManager = new ServientManager(config.concat(config2))
    let servient1 = servientManager.getServient("servient1")
    expect(servient1).toBeDefined();
    let servient2 = servientManager.getServient("servient2")
    expect(servient2).toBeDefined();

    expect(servient1.getServers().length).toBe(1);
    expect(servient1.getServers()[0]).toBeInstanceOf(HttpServer)

    expect(servient2.getServers().length).toBe(1);
    expect(servient2.getServers()[0]).toBeInstanceOf(MqttBrokerServer)
})


test("start servient", async() =>  {
    let servientManager: ServientManager = new ServientManager(config)
    let servient = servientManager.getServient("servient1")
    await servient.start()
    expect(servient.getServers()[0].getPort()).toBe(3000)
    await servient.shutdown()
})

test("search wrong servient", () => {
    let servientManager: ServientManager = new ServientManager(config)
    try {
        servientManager.getServient("servient2")
    }
    catch(e) {
        expect(e).toBeInstanceOf(Error);
    }
})

test("start all servients", async() => {
    let servientManager: ServientManager = new ServientManager(config)
    await servientManager.start();
    let servient = servientManager.getServient("servient1")
    expect(servient.getServers()[0].getPort()).toBe(3000)
    await servientManager.stop();
})


