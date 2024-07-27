
import DslWorld from "../dsl/dsl-world";
import CommandProcessor from "../dsl/processors/command-processor";
import Logger from "../logger";
import * as readline from 'readline';
import { WebSocket } from 'ws';
import { MudClient } from "./MudClient";
import { ProcessAlias } from "../dsl/process-alias";

export class MudClientApp {
    private host: string;
    private port: number;
    private mudClientLogger: Logger;
    private processors: CommandProcessor;
    private mudClient: MudClient;
    private aliasProcessor: ProcessAlias;
    private inputHandler: readline.Interface | WebSocket;
    private webSocketClient?: WebSocket;

    constructor(host: string, port: number, inputHandler: readline.Interface | WebSocket) {
        this.host = host;
        this.port = port;
        this.mudClientLogger = new Logger("dsl-mud-client");
        this.processors = new CommandProcessor({
            log: this.mudClientLogger.getChildLogger('command-processor')
        });
        this.mudClientLogger.info(`Total processors after addition: ${this.processors['processors'].length}`);
        this.aliasProcessor = new ProcessAlias({});
        this.inputHandler = inputHandler;
        this.mudClient = new MudClient({
            host: this.host,
            port: this.port,
            log: this.mudClientLogger,
            world: undefined
        });
    }

    async initialize(): Promise<void> {
        const dslWorld = new DslWorld({});
        await dslWorld.Initialize();
        this.mudClient.world = dslWorld;
        this.mudClient.setCommandHandler((data) => this.processors.handler(data));
        this.setupInputHandler();
        await this.mudClient.connect();
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

    private async handleCommand(input: string): Promise<void> {
        try {
            const result = await this.aliasProcessor.SendCommand(input);
            if (result !== undefined && result.length > 0) {
                for (const command of result) {
                    console.log(`Sending command: ${command}`);
                    this.mudClient.sendCommand(command);
                }
            }
        } catch (error) {
            this.mudClientLogger.error('Error processing alias command', error);
        }
    }

    public setWebSocketClient(ws: WebSocket): void { 
        this.webSocketClient = ws;
        this.mudClient.setWebSocketClient(ws);
    }
}