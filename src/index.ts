import Logger from './logger';
import { MudClient } from './mud/MudClient';
import * as readline from 'readline';
import DslWorld from './dsl/dsl-world';

class MudClientApp {
    private host: string;
    private port: number;
    private mudClientLogger: Logger;
    private mudClient: MudClient;
    private rl: readline.Interface;

    constructor(host: string, port: number) {
        this.host = host;
        this.port = port;
        this.mudClientLogger = new Logger("dsl-mud-client");
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
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
        this.setupInputHandler();
        await this.mudClient.connect();
    }

    private setupInputHandler(): void {
        this.rl.on('line', async (input) => {
            if (input.trim().toLowerCase() === 'quit') {
                this.rl.close();
            } else {
                await this.handleCommand(input);
            }
        });

        this.rl.on('close', () => {
            this.mudClient.disconnect();
            process.exit(0);
        });
    }

    private async handleCommand(input: string): Promise<void> {
        try {
            this.mudClient.sendCommand(input);
        } catch (error) {
            this.mudClientLogger.error('Error processing command', error);
        }
    }
}

(async () => {
    const HOST = 'dsl-mud.org';
    const PORT = 4000;
    const app = new MudClientApp(HOST, PORT);
    await app.initialize();
})();