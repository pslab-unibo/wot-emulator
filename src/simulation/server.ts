
import { Scheduler } from "./scheduler";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initialize } from "./init";

export function inizializeServer(scheduler : Scheduler): void{
    const app = express();
    const httpServer = createServer(app);
    const io = new Server(httpServer, { 
        cors: {
            origin: 'http://localhost:5173'
        }
     });

    io.on("connect", (socket) => {
        console.log('Connected ...', socket.id);

        const intervalId = setInterval(() => {
            if (scheduler.isRunning()) {
                io.emit("update", scheduler.getChanges());
            }
        }, 1000);

        socket.on('schedulerCommand', (data) => {
            const { command } = data;
            //console.log(`Received command: ${command}`);
    
            switch (command) {
                case 'start':
                    if (scheduler.isRunning()) {
                        console.warn('Scheduler is already running');
                        break;
                    }
                    initialize(scheduler).then(() => {
                        scheduler.start();
                        io.emit("setup", scheduler.getJson());
                    });
                    break;
                case 'pause':
                    scheduler.pause();
                    break;
                case 'resume':
                    scheduler.resume();
                    break;
                case 'stop':
                    scheduler.stop();
                    break;
                default:
                    console.log('Unknown command:', command);
            }
        });
    
        io.on("disconnect", (socket) => {
            console.log(`Disconnected: ${socket.id}`);
            clearInterval(intervalId);
        });

    });

    httpServer.listen(3000, () => {
        console.log('Server is connected');
    });
}