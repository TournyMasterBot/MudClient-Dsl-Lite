/**
 * Our main MushClient script file, this is what will be
 * specified in the script selector
 */

import Logger from "../logger";
import { DslWorldConfig } from "../models/dsl-models/dsl-world-config";
import World, { IWorld } from "../models/dsl-models/world";
import { IDslSession, DslSession } from "./dsl-session";

/** Define the world config */
const dslConfig = new DslWorldConfig({});

export interface IDslWorld {
    dslWorld: IWorld;
    session: IDslSession;
    
    Initialize(): void;
    LoadScripts(): void;
    SetSession(session: IDslSession): void;
}

export class DslWorld implements IDslWorld {
    public dslWorld: IWorld;
    public session: IDslSession;

    constructor(config: Partial<DslWorld>) {
        const logger = new Logger("dsl-world");
        // Create the world
        this.dslWorld = new World({
            log: logger,
        });
        
        // Initialize the session
        this.session = new DslSession({
            quitCount: 0,
            showBattleSpam: true
        });
        
        console.log(`Loaded world with the following session variables: ${JSON.stringify({ session: this.session }, null, 2)}`)
    }
    

    public async Initialize(): Promise<void> {

    }

    public LoadScripts(): void {
        this.dslWorld.log.info("Dsl Scripts Loading");
    }

    public SetSession(session: IDslSession): void {
        this.session = session;
    }
}

export default DslWorld;