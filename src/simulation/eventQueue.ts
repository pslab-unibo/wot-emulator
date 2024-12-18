type EventHandler = () => Promise<void>; 

// Class managing a queue of events
class EventQueue {
  
    private eventQueue: Array<{
        handler: EventHandler,
        priority: number,
        timestamp: number
    }> = [];  

    /**
     * Adds a new event to the queue with an optional priority.
     * Events are automatically sorted by priority and timestamp (FIFO for same priority).
     */
    public enqueueEvent(
        handler: EventHandler, 
        priority: number = 1
    ) : void{
      // Add the new event to the queue
      this.eventQueue.push({
          handler,
          priority,
          timestamp: Date.now()
      });
      
      // Sort the queue by priority (descending) and timestamp (ascending for same priority)
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

          // Remove the first event from the queue and execute its handler
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

      public clearQueue(): void {
        console.log("Clearing event queue...");
        this.eventQueue = []; 
    }
}

export const eventQueue = new EventQueue();
