import { IDslWorld } from "../../dsl/dsl-world";
import Logger from "../../logger";

export interface IMudClient {
    host: string;
    port: number;
    log: Logger;
    world?: IDslWorld | undefined;
    connect(): void;
    sendCommand(command: string): void;
    disconnect(): void;
}

export default IMudClient;