import * as bunyan from 'bunyan';

export interface ILogger {
    info(message: string, ...params: any[]): void;
    error(message: string, ...params: any[]): void;
    debug(message: string, ...params: any[]): void;
    warn(message: string, ...params: any[]): void;
    trace(message: string, ...params: any[]): void;
    fatal(message: string, ...params: any[]): void;
}

class Logger implements ILogger {
    private logger: bunyan;

    constructor(name: string) {
        this.logger = bunyan.createLogger({
            name: name,
            streams: [
                {
                    level: 'trace',
                    stream: process.stdout // log DEBUG and above to stdout
                }
            ]
        });
    }

    public getChildLogger(name: string): Logger {
        return new Logger(`${this.logger.fields.name}.${name}`);
    }

    public serverMessage(message: string): void {
        console.log(`${message}`);
    }

    public info(message: string, ...params: any[]): void {
        this.logger.info(params, message);
    }

    public error(message: string, ...params: any[]): void {
        this.logger.error(params, message);
    }

    public debug(message: string, ...params: any[]): void {
        this.logger.debug(params, message);
    }

    public warn(message: string, ...params: any[]): void {
        this.logger.warn(params, message);
    }

    public trace(message: string, ...params: any[]): void {
        this.logger.trace(params, message);
    }

    public fatal(message: string, ...params: any[]): void {
        this.logger.fatal(params, message);
    }
}

export default Logger;