import { CONFIG } from "../main";
import { Thing } from "../thing-model/Thing";
import * as fs from 'fs';
import slugify from 'slugify';

export function generateJson(things: Thing[], environments: Thing[]): any[] {
    things = [...environments, ...things];
    const thingsJson: any[] = [];

    things.forEach(thing => {
        const parsedThing = JSON.parse(thing.toString());
        if (Array.isArray(parsedThing)) {
            thingsJson.push(...parsedThing);
        } else {
            thingsJson.push(parsedThing);
        }
    });

    return thingsJson;
}

export function generatePatch(json1: any[], json2: any[]) {
    const patch: any[] = [];

    for (let i = 0; i < json1.length; i++) {
        const thing1 = json1[i];
        const thing2 = json2[i];

        if (thing1.title !== thing2.title) {
            throw new Error(`Titles do not match for index ${i}: "${thing1.title}" vs "${thing2.title}"`);
        }

        const changes: any = { "title": thing1.title };

        Object.keys(thing1).forEach(key => {
            if (key !== "title" && thing1[key] !== thing2[key]) {
                changes[key] = thing2[key]; 
            }
        });

        if (Object.keys(changes).length > 1) {
            patch.push(changes);
        }
    }

    return patch;
}

export function generateUri() {
    const init = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
    const things = [...init.environments, ...init.things];
    const servients = init.servients;
    const URL = [];

    const servientsMap = new Map();

    for (const item of servients) {
        servientsMap.set(item.id, { host: item.host, port: item.port, type: item.type });
    }

    for (const thing of things) {
        const id = thing.servient ? thing.servient : Array.from(servientsMap.keys())[0];
        if (id !== undefined) {
            const servient = servientsMap.get(id);
            const url = servient.type + '://' + servient.host + ':' + servient.port + '/' + slugify(thing.title, {lower: true});
            URL.push({"title": thing.title, "type": thing.type, "URI": url});
        } 
    }

    return URL;
}
