import * as readline from 'readline';
import { eventQueue } from '../simulation/eventQueue';

export function startCommandListener() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', (input) => {
        const [thingId, action] = input.trim().split(' ');
        console.log("Event Enqueue");
        eventQueue.enqueueCommand(thingId, action);
    });

    console.log("Listening for commands. Type 'thingId action'.");
}
