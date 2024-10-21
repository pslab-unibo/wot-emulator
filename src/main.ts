import { Servient, ExposedThing } from "@node-wot/core"; 
import { LampThing } from "./thing-model/things/LampThing";

// Creazione del Servient
const servient = new Servient();

const lamp = new LampThing(servient, {
    id: "urn:dev:wot:lamp",
    title: "Lamp Thing",
});

servient.addThing(lamp);

const thing = servient.getThing('urn:dev:wot:lamp');

// Funzione di attesa
function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    while (true) {
        if (thing) {
            await thing.tick();  // Chiama il metodo tick su 'Thing' reale.
        }
        console.log('nuovo giro');
        await wait(2000);  // Aspetta 5000 ms (5 secondi).
    }
}

// Esegui la funzione run
run();
