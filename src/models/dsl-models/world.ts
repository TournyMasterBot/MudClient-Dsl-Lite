import { ILogger } from "../../logger";

export interface IWorld {
    log: ILogger;
}

export class World implements IWorld {
    log: ILogger;

    constructor(config: Partial<World>) {
        this.log = config.log!;
    }   
}

export default World;