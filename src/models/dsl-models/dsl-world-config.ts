export interface IDslWorldConfig {    
    /**
     * Indicator whether or not you want to utilize a local server
     */
    useLocalServer: boolean;
    /**
     * Endpoint for local server
     */
    localServer: string;
    /**
     * Local server port
     */
    localServerPort: number;
    /** 
     * Indicator whether or not you want to utilize a remote server
     */
    useRemoteServer: boolean;
    /**
     * Endpoint for remote server
     */
    remoteServer: string;
    /**
     * Remote server port
     */
    remoteServerPort: number;
    /**
     * Base folder path that stores JSON for areas exported from shattered archive
     * @ref https://shatteredarchive.com/directions/all
     */
    areasPath: string;
    /**
     * Folder path to store sqlite data table
     */
    sqlitePath: string;
}

export class DslWorldConfig implements IDslWorldConfig {
    useLocalServer: boolean;
    localServer: string;
    localServerPort: number;
    useRemoteServer: boolean;
    remoteServer: string;
    remoteServerPort: number;
    areasPath: string;
    sqlitePath: string;

    constructor(config: Partial<IDslWorldConfig>) {
        this.useLocalServer = config.useLocalServer || false;
        this.localServer = config.localServer || '';
        this.localServerPort = config.localServerPort || 0;
        this.useRemoteServer = config.useRemoteServer || false;
        this.remoteServer = config.remoteServer || '';
        this.remoteServerPort = config.remoteServerPort || 0;
        this.areasPath = config.areasPath || '';
        this.sqlitePath = config.sqlitePath!;
    }
}