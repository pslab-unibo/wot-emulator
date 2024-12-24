
import { Scheduler } from "./scheduler";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initialize } from "./init";

export function inizializeServer(): void{
    const app = express();
    const httpServer = createServer(app);
    let scheduler : Scheduler  = new Scheduler(500);
    const io = new Server(httpServer, { 
        cors: {
            origin: 'http://localhost:5173'
        }
     });

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
                    //scheduler = new Scheduler(500);
                    initialize(scheduler).then(() => {
                        scheduler.start();
                        io.emit("serverStarted");
                        io.emit("setup", scheduler.getJson());

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
    
        io.on("disconnect", (socket) => {
            console.log(`Disconnected: ${socket.id}`);
        });

    });

    httpServer.listen(3000, () => {
        console.log('Server is connected');
    });
}