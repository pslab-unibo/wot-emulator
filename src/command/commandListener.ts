import * as readline from 'readline';
import { eventQueue } from '../simulation/eventQueue';
import { Scheduler } from '../simulation/scheduler';

// Function to start listening for command line input
export function startCommandListener(scheduler? : Scheduler) {
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Event listener for each line of input entered by the user
    rl.on('line', (input) => {
        const [thingId, action] = input.trim().split(' ');
        console.log("Event Enqueue");
        if (scheduler) {
            //eventQueue.enqueueCommand(thingId, action, scheduler);
        }
    });

    console.log("Listening for commands. Type 'thingId action'.");
}
