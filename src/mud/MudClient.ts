import * as net from 'net';
import Logger from '../logger';
import { IDslWorld } from '../dsl/dsl-world';
import IMudClient from '../models/mud-client/IMudClient';
import { removeANSIEscapeCodes } from '../utils/string-utils';
import { WebSocket } from 'ws';

export class MudClient implements IMudClient {
    public host: string;
    public port: number;
    public log: Logger;
    public world?: IDslWorld | undefined;

    private client: net.Socket;
    private webSocketClient?: WebSocket;

    constructor(config: Partial<MudClient>) {
        this.log = config.log!;
        this.host = config.host!;
        this.port = config.port!;
        this.world = config.world;
        this.client = new net.Socket();

        this.client.on('data', (data) => this.onData(data));
        this.client.on('close', () => this.onClose());
        this.client.on('error', (error) => this.onError(error));
    }

    public connect(): void {
        this.client.connect(this.port, this.host, () => {
            this.log.serverMessage(`Connected to MUD server at ${this.host}:${this.port}`);
        });
    }

    public sendCommand(command: string): void {
        this.client.write(`${command}\n`);
    }

    public disconnect(): void {
        this.log.serverMessage("Client requested server disconnect");
        this.client.end();
    }

    public setWebSocketClient(ws: WebSocket): void {
        this.webSocketClient = ws;
    }

    private onData(data: Buffer): void {
        const receivedData = data.toString();
        // Send raw ANSI codes to WebSocket client
        if (this.webSocketClient) {
            this.webSocketClient.send(receivedData);
        }

        // Cleaned data for logging purposes
        this.log.serverMessage(receivedData);
    }

    private onClose(): void {
        this.log.serverMessage('Connection closed');
        process.exit(0);
    }

    private onError(error: Error): void {
        this.log.error('Error:', { err: error });
        process.exit(1);
    }
}
