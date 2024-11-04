import { Scheduler } from "./scheduler";

// Enum for different types of events
enum EventType {
    COMMAND = 'COMMAND',
    INTERNAL_EVENT = 'INTERNAL_EVENT'
}

interface Event {
    event_type: EventType;
    thingId?: string;
    event_name?: string;
    params?: any;
    priority: number;
    timestamp: number;
}  

// Class managing a queue of events
class EventQueue {
  
    private eventQueue: Event[] = [];  

    public enqueueEvent(event: Event) {
        this.eventQueue.push(event);
        
        this.eventQueue.sort((a, b) => {
            if (a.priority !== b.priority) {
              return b.priority - a.priority;
            }
            return a.timestamp - b.timestamp;
          });
    }

    public enqueueCommand(thingId: string, command: string) {
        this.enqueueEvent({
            event_type : EventType.COMMAND,
            thingId : thingId,
            event_name : command,
            params : undefined,
            priority : 1,
            timestamp : Date.now(),
        });
    }

    private async handleEvent(event: Event, scheduler?:Scheduler) {
        switch (event.event_type) {
    
          case EventType.COMMAND:
            // Passes command events to the scheduler
            if (event.thingId && event.event_name && scheduler) {
                scheduler.handleCommand(event.thingId, event.event_name);
            }
            break;
    
          case EventType.INTERNAL_EVENT:
            // Internal event triggered by other Things
            break;
        }
    }

    // Processes events in the queue recursively until empty
    public async processQueue(scheduler?: Scheduler) {
        if (this.eventQueue.length === 0) {
          return;
        }

        try {
            const event = this.eventQueue.shift();
            await this.handleEvent(event as Event, scheduler);
        } catch (error) {
          console.error(`Error processing event: ${error}`);
        }
        
        // Schedule the next queue processing step immediately
        setImmediate(() => this.processQueue(scheduler));
      }
}

export const eventQueue = new EventQueue();
