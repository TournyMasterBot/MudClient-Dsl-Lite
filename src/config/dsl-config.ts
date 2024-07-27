import { DslWorldConfig } from "../models/dsl-models/dsl-world-config";

/** 
 * Define the world config
 * HACKFIX: This needs to match src\public\dsl-config.js
 * */
export const dslConfig = new DslWorldConfig({
    useLocalServer: false,
    localServer: "192.168.0.62",
    localServerPort: 4000,
    useRemoteServer: false,
    remoteServer: "shatteredarchive.com",
    remoteServerPort: 4000,
    areasPath: "C:/Projects/DslScripts/data/areas",
    sqlitePath: "C:/Projects/DslScripts/data/db",
});
export default dslConfig;