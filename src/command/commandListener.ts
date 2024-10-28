import * as readline from 'readline';
import { commandEmitter } from './CommandEmitter';

export function startCommandListener() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', (input) => {
        const [thingId, action] = input.trim().split(' ');
        commandEmitter.sendCommand(thingId, action);
    });

    console.log("Listening for commands. Type 'thingId action' (e.g., 'lamp1 turnOn').");
}
