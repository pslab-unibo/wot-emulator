import { Scheduler } from "./scheduler";

type EventHandler = () => Promise<void>; 

// Class managing a queue of events
class EventQueue {
  
    private eventQueue: Array<{
        handler: EventHandler,
        priority: number,
        timestamp: number
    }> = [];  

    public enqueueEvent(
        handler: EventHandler, 
        priority: number = 1
    ) {
        this.eventQueue.push({
            handler,
            priority,
            timestamp: Date.now()
        });
        
        this.eventQueue.sort((a, b) => {
            if (a.priority !== b.priority) {
              return b.priority - a.priority;
            }
            return a.timestamp - b.timestamp;
          });
    }

    // Processes events in the queue recursively until empty
    public async processQueue() {
        if (this.eventQueue.length === 0) {
          return;
        }

        try {
            const event = this.eventQueue.shift();
            if (event) {
              await event.handler();
            }
        } catch (error) {
          console.error(`Error processing event: ${error}`);
        }
        
        // Schedule the next queue processing step immediately
        setImmediate(() => this.processQueue());
      }
}

export const eventQueue = new EventQueue();
