import * as net from 'net';
import Logger from '../logger';
import { IDslWorld } from '../dsl/dsl-world';
import { CommandProcessorInput, CommandProcessorOutput } from '../dsl/processors/command-processor';
import { removeANSIEscapeCodes } from '../utils/string-utils';
import { WebSocket } from 'ws';
import IMudClient from '../models/mud-client/IMudClient';

export class MudClient implements IMudClient {
    public host: string;
    public port: number;    
    public log: Logger;
    public world?: IDslWorld | undefined;

    private commandHandler: ((command: CommandProcessorInput) => Promise<CommandProcessorOutput>) | null = null;
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
            this.sendMessage(`Connected to MUD server at ${this.host}:${this.port}`);
        });
    }

    /**
     * Sends a command to the remote server
     */
    public sendCommand(command: string): void {
        this.client.write(`${command}\n`);
    }

    public disconnect(): void {
        this.sendMessage("Client requested server disconnect");
        this.client.end();
    }

    public setWebSocketClient(ws: WebSocket): void {
        this.webSocketClient = ws;
    }

    public setCommandHandler(handler: (command: CommandProcessorInput) => Promise<CommandProcessorOutput>): void {
        this.commandHandler = handler;
    }

    public async onData(data: Buffer): Promise<void> {
        const receivedData = data.toString();        
        const removeAnsiCodesFromData = removeANSIEscapeCodes(receivedData);
        if (this.commandHandler) {
            try {
                const commandResult = await this.commandHandler({
                    shouldEchoRawCommand: false,
                    shouldEchoFinalCommand: true,
                    rawCommandData: receivedData,
                    rawCommand: removeAnsiCodesFromData,
                    finalOutput: receivedData
                });
                if(commandResult.shouldEchoRawCommand) {
                    this.sendMessage(receivedData);
                }
                if(commandResult.shouldEchoFinalCommand) {
                    this.sendMessage(commandResult.modifiedCommand.finalOutput);
                }
            } catch (error: any) {
                this.log.error('Error handling command:', { err: error });
            }
        } else {
            this.sendMessage(receivedData);
        }
    }

    /**
     * Writes a message to the local web client and CLI
     */
    public sendMessage(message: string): void {
        this.log.serverMessage(message);
        if (this.webSocketClient) {
            this.webSocketClient.send(message);
        } 
    }

    public onClose(): void {
        this.sendMessage('Connection closed');
        process.exit(0);
    }

    public onError(error: Error): void {
        this.log.error('Error:', { err: error});
        //process.exit(1);
    }
}

// Handling uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(2);
});

// Handling unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(3);
});

export default MudClient;