import { CONFIG } from "../main";
import { Thing } from "../thing-implementation/Thing";
import * as fs from 'fs';
import slugify from 'slugify';

// Function to generate a JSON representation of all things
export function generateJson(things: Thing[], environments: Thing[]) {
    // Combine environments and things into one array
    things = [...environments, ...things];

    // Convert each Thing to its JSON representation using the `toString` method
    const thingsJson = things.map(thing => JSON.parse(thing.toString()));
    return thingsJson;
}

// Function to generate a patch (set of differences) between two JSON arrays
export function generatePatch(json1: any[], json2: any[]) {
    const patch: any[] = [];    // Store the changes (patch)

    // Iterate over the things in both JSON arrays
    for (let i = 0; i < json1.length; i++) {
        const thing1 = json1[i];
        const thing2 = json2[i];

        if (thing1.title !== thing2.title) {
            throw new Error(`Titles do not match for index ${i}: "${thing1.title}" vs "${thing2.title}"`);
        }

        // Initialize an object to store the changes for the current Thing
        const changes: any = { "title": thing1.title };

        // Compare the properties of the two things, ignoring the "title" property
        Object.keys(thing1).forEach(key => {
            if (key !== "title" && thing1[key] !== thing2[key]) {
                changes[key] = thing2[key]; 
            }
        });

        // If there are changes (other than the title), add the change object to the patch
        if (Object.keys(changes).length > 1) {
            patch.push(changes);
        }
    }

    return patch;
}

// Function to generate URIs for all things, using information from configuration
export function generateUri() {
    // Read and parse the configuration file
    const init = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
    
    // Combine the lists of environments and things into one array
    const things = [...init.environments, ...init.things];
    const servients = init.servients;
    const data = []; // Store the generated URLs

    // Create a map of servients by their ID, including host, port, and type
    const servientsMap = new Map();
    for (const item of servients) {
        servientsMap.set(item.id, { host: item.host, port: item.port, type: item.type });
    }

    // Generate a URI for each thing, based on its associated servient
    for (const thing of things) {
        const id = thing.servient ? thing.servient : Array.from(servientsMap.keys())[0];
        if (id !== undefined) {
            const servient = servientsMap.get(id);
            const url = servient.type + '://' + servient.host + ':' + servient.port + '/' + slugify(thing.title, {lower: true});
            
            // Store the generated URL, along with the Thing's title and type
            data.push({"title": thing.title, "type": thing.type, "roomId": thing.roomId, "URI": url});
        } 
    }

    return data;
}
