import { Configuration, ServientType } from "../dist/configuration";


test("I can create a configuration", () => {
    const config: Configuration = {
        period: 1000,
        servients: [
            {
                type: ServientType.HTTP,
                id: "servient",
                data: {}
            }
        ],
        environment: {
            type: "Room",
            title: "Room",
            servient: "servient1",
        },
        things: [
            {
                type: "thing-type",
                title: "Thing 1",
                servient: "servient1",
                situated: true,
                data: {}
            }
        ],
        envFolder: "./environments",
        thingFolder: "./things"
    };

    expect(config).toBeDefined();

});