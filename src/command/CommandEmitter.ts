import { EventEmitter } from 'events';

class CommandEmitter extends EventEmitter {
    sendCommand(thingId: string, action: string) {
        this.emit('command', { thingId, action });
    }
}

export const commandEmitter = new CommandEmitter();
