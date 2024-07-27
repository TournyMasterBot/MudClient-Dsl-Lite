import Logger from "../../logger";

export interface ICommandProcessor {
    handler: (command: CommandProcessorInput) => Promise<CommandProcessorOutput>;
}

export class CommandProcessorInput {
    /**
     * Raw command data from the mud, this can include ANSI color codes
     */
    public rawCommandData: string;
    /**
     * Raw command data from the mud, stripped of ANSI color codes
     */
    public rawCommand: string;

    public shouldEchoRawCommand: boolean;
    public shouldEchoFinalCommand: boolean;
    
    public finalOutput: string;
    public modifiedCommand?: CommandProcessorInput | undefined;

    constructor(config: Partial<CommandProcessorInput>) {
        this.shouldEchoRawCommand = config.shouldEchoRawCommand ?? false;
        this.shouldEchoFinalCommand = config.shouldEchoFinalCommand ?? true;
        this.rawCommandData = config.rawCommandData!;
        this.rawCommand = config.rawCommand!;
        this.finalOutput = config.rawCommand!;
        this.modifiedCommand = config.modifiedCommand;
    }
}

export class CommandProcessorOutput {
    public shouldEchoRawCommand: boolean;
    public shouldEchoFinalCommand: boolean;
    public modifiedCommand: CommandProcessorInput;

    constructor(config: Partial<CommandProcessorOutput>) {
        this.modifiedCommand = config.modifiedCommand!;
        this.shouldEchoRawCommand = config.shouldEchoRawCommand ?? false;
        this.shouldEchoFinalCommand = config.shouldEchoFinalCommand ?? true;
    }
}

export class CommandProcessor implements ICommandProcessor {
    public log: Logger;
    private processors: { handler: (command: CommandProcessorInput) => Promise<CommandProcessorOutput>; active: boolean }[];

    constructor(config: Partial<CommandProcessor> = {}) {
        this.log = config.log!;
        this.processors = [];
    }

    public async handler(command: CommandProcessorInput): Promise<CommandProcessorOutput> {
        let lastCommandOutput: CommandProcessorOutput = { modifiedCommand: command, shouldEchoRawCommand: false, shouldEchoFinalCommand: true };
        if (this?.processors?.length > 0) {
            for (const processor of this.processors) {
                if (processor.active) {
                    try {
                        const commandResult = await processor.handler({
                            rawCommandData: command.rawCommandData,
                            rawCommand: command.rawCommand,
                            finalOutput: lastCommandOutput.modifiedCommand.finalOutput,
                            modifiedCommand: lastCommandOutput.modifiedCommand,
                            shouldEchoRawCommand: lastCommandOutput.shouldEchoRawCommand,
                            shouldEchoFinalCommand: lastCommandOutput.shouldEchoFinalCommand
                        });
                        lastCommandOutput = commandResult;
                    } catch (error) {
                        this.log.error('Error processing command:', error);
                    }
                }
            }
        }
        return lastCommandOutput;
    }

    public addProcessor(processor: ICommandProcessor): void {
        this.processors.push({ handler: processor.handler, active: true });
        this.log.info(`Processor added. Total processors: ${this.processors.length}`);
    }

    public removeProcessor(handler: (command: CommandProcessorInput) => Promise<CommandProcessorOutput>): void {
        const index = this.processors.findIndex(p => p.handler === handler);
        if (index !== -1) {
            this.processors.splice(index, 1);
            this.log.info(`Processor removed. Total processors: ${this.processors.length}`);
        }
    }

    public setProcessorActive(handler: (command: CommandProcessorInput) => Promise<CommandProcessorOutput>, active: boolean): void {
        const processor = this.processors.find(p => p.handler === handler);
        if (processor) {
            processor.active = active;
            this.log.info(`Processor set to ${active ? 'active' : 'inactive'}.`);
        }
    }
}

export default CommandProcessor;