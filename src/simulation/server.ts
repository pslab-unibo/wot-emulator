import { Scheduler } from "./scheduler";
import express from 'express';
import cors from 'cors';

export function inizializeServer(scheduler : Scheduler): void{
    const app = express();
    const port = 3000;
    var things : any = null;

    app.use(cors({
        origin: 'http://localhost:5173'
    }));

    app.get('/api/things', (req, res) => {
        things = scheduler.getJson();
        res.json(things); 
    });

    app.get('/api/changes', (req, res) => {
        const changes = scheduler.generatePatch(things, scheduler.getJson());
        res.json(changes); 
    });

    // Avvio del server
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
}