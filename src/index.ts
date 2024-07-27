import * as readline from 'readline';
import { MudClientApp } from './mud/MudApp';

(async () => {
    const HOST = 'dsl-mud.org';
    const PORT = 4000;

    // Create readline interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Initialize the CLI version of MudClientApp
    const app = new MudClientApp(HOST, PORT, rl);
    await app.initialize();
})();
