// mudapp.ts
import DslWorld from "../dsl/dsl-world";
import Logger from "../logger";
import * as readline from 'readline';
import { WebSocket } from 'ws';
import { MudClient } from "./MudClient";

export class MudClientApp {
    private inputHandler: readline.Interface | WebSocket;
    private host: string;
    private port: number;
    private mudClientLogger: Logger;
    private mudClient: MudClient;
    private webSocketClient?: WebSocket;

    constructor(
        host: string, 
        port: number, 
        inputHandler: readline.Interface | WebSocket
    ) {
        this.host = host;
        this.port = port;
        this.mudClientLogger = new Logger("dsl-mud-client");
        this.mudClient = new MudClient({
            host: this.host,
            port: this.port,
            log: this.mudClientLogger,
            world: undefined
        });
        this.inputHandler = inputHandler;

        this.setupInputHandler();
    }

    async initialize(): Promise<void> {
        const dslWorld = new DslWorld({});
        await dslWorld.Initialize();
        this.mudClient.world = dslWorld;
        await this.mudClient.connect();

        // Set the WebSocket client if available
        if (this.webSocketClient) {
            this.mudClient.setWebSocketClient(this.webSocketClient);
        }
    }

    private setupInputHandler(): void {
        if (this.inputHandler instanceof readline.Interface) {
            this.inputHandler.on('line', async (input) => {
                await this.handleCommand(input);
                if (input.trim().toLowerCase() === 'quit') {
                    this.inputHandler.close();
                }
            });

            this.inputHandler.on('close', () => {
                this.mudClient.disconnect();
                process.exit(0);
            });
        } else if (this.inputHandler instanceof WebSocket) {
            this.inputHandler.on('message', async (message) => {
                await this.handleCommand(message.toString());
            });

            this.inputHandler.on('close', () => {
                this.mudClient.disconnect();
            });

            // Save the WebSocket client
            this.webSocketClient = this.inputHandler;
        }
    }

    public setWebSocketClient(ws: WebSocket): void { 
        this.webSocketClient = ws;
        this.mudClient.setWebSocketClient(ws);
    }

    public async handleCommand(input: string): Promise<void> {
        try {
            this.mudClient.sendCommand(input);
        } catch (error: any) {
            this.mudClientLogger.error('Error processing command', error);
        }
    }
}
