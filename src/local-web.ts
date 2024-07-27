import express from 'express';
import path from 'path';
import { Server } from 'ws';
import { MudClientApp } from './mud/MudApp';
import dslConfig from './config/dsl-config';

const args = process.argv.slice(2);
console.log(args);
const serverIP: string = args[0] || "0.0.0.0";;
const serverPort: number = parseInt(args[1] || "4000", 10);
const isServer: boolean = (args[2] || "local") === "server" ? true : false;
isServer ? dslConfig.useRemoteServer = true : dslConfig.useLocalServer;

const app = express();
const localhostOnly: boolean = false;
app.use(express.static(path.join(__dirname, '../public')));

const server = app.listen(serverPort, serverIP, () => {
    console.log(`Server running at http://${serverIP}:${serverPort}`);
});

const DSLHOST = 'dsl-mud.org';
const DSLPORT = 4000;
const socketServer = new Server({ server });

socketServer.on('connection', (ws) => {
    console.log('WebSocket connection established');

    const mudClientApp = new MudClientApp(DSLHOST, DSLPORT, ws);
    mudClientApp.initialize();

    // Pass WebSocket client to MudClient
    mudClientApp.setWebSocketClient(ws);

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});
