
import { Scheduler } from "./scheduler";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initialize } from "./init";
import { error } from "../utils/action-result";
import { generateUri } from "../utils/jsonUtils";

// Initializes the server and sets up WebSocket communication with clients.
export function inizializeServer(): void{
    const app = express();
    const httpServer = createServer(app);
    let scheduler : Scheduler  = new Scheduler(500);

    // Set up a Socket.IO server with CORS configuration
    const io = new Server(httpServer, { 
        cors: {
            origin: 'http://localhost:5173'
        }
     });

    app.get('/setup', (req, res) => {
        if (scheduler) {
            const setupData = scheduler.getThingState(); 
            res.json(setupData); // Respond with the setup state as JSON
        } else {
            error({code: 500, message: 'Scheduler not initialized'});
        }
    });

    app.get('/things', (req, res) => {
        if (scheduler) {
            const thingsData = generateUri(); 
            res.json(thingsData);
        } else {
            error({code: 500, message: 'Scheduler not initialized'});
        }
    });

    app.get('/status', (req, res) => {
        if (scheduler) {
            res.json({ running: scheduler.isRunning() }); // Respond with the scheduler status as JSON
        } else {
            error({code: 500, message: 'Scheduler not initialized'});
        }
    });
    

    // Handle new WebSocket connections
    io.on("connect", (socket) => {
        console.log('Connected ...', socket.id);

        let intervalId: NodeJS.Timeout | null = null;

        
        socket.on('schedulerCommand', (data) => {
            const { command } = data;
    
            switch (command) {
                case 'start':
                    if (scheduler && scheduler.isRunning()) {
                        console.warn('Scheduler is already running');
                        break;
                    }
                    
                    // Initialize and start the scheduler, then notify the client
                    initialize(scheduler).then(() => {
                        scheduler.start();
                        io.emit("serverStarted");
                        io.emit("setup", scheduler.getThingState());

                        // Set up an interval to periodically send updates to the client
                        intervalId = setInterval(() => {
                            const changes = scheduler.getChanges();
                            io.emit("update", changes);
                        }, 1000);
                    });
                    break;
                case 'pause':
                    scheduler.pause();
                    break;
                case 'resume':
                    scheduler.resume();
                    break;
                case 'stop':
                    // Stop the scheduler and clean up resources
                    scheduler.stop().then(() => {
                        io.emit("serverStopped");

                        if (intervalId) {
                            clearInterval(intervalId);
                            intervalId = null;
                        }
                    });
                    break;
                default:
                    console.log('Unknown command:', command);
            }
        });
        
        // Handle client disconnection
        io.on("disconnect", (socket) => {
            console.log(`Disconnected: ${socket.id}`);
        });

    });

    // Start the HTTP server on port 3000
    httpServer.listen(3000, () => {
        console.log('Server is connected');
    });
}