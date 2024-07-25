import express from 'express';
import path from 'path';
import { Server } from 'ws';
import { MudClientApp } from './mud/MudApp';

const app = express();
const port = 4000;

app.use(express.static(path.join(__dirname, '../public')));

const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

const HOST = 'dsl-mud.org';
const PORT = 4000;

const wss = new Server({ server });

wss.on('connection', (ws) => {
    console.log('WebSocket connection established');

    const mudClientApp = new MudClientApp(HOST, PORT, ws);
    mudClientApp.initialize();

    // Pass WebSocket client to MudClient
    mudClientApp.setWebSocketClient(ws);

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});
