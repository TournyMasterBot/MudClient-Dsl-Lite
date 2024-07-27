import { rejoinFromIndex } from "../utils/string-utils";

export interface IProcessAlias {
    SendCommand(command: string): Promise<string[] | undefined>;
    ProcessSinglePartCommand(command: string): Promise<string[] | undefined>;
    ProcessMultiPartCommand(rawCommand: string, commandParts: string[]): Promise<string[] | undefined>;
}

export class ProcessAlias implements IProcessAlias {
    constructor(config: Partial<ProcessAlias>) {}

    async SendCommand(command: string): Promise<string[] | undefined> {
        const lowerCaseCommand = command.toLowerCase().trim();
        const commandParts: string[] = lowerCaseCommand.split(" ").filter(part => part.trim() !== "");

        // Empty line feed, return early, no point in processing
        if(command.length === 0) {
            return [""];
        }

        // Process single line verse multi part separately,
        // This helps with performance, but it can also help prevent command ambiguity
        if (commandParts.length === 1) {
            return this.ProcessSinglePartCommand(commandParts[0]);
        } else {
            return this.ProcessMultiPartCommand(command, commandParts);
        }
    }

    async ProcessSinglePartCommand(command: string): Promise<string[] | undefined> {
        let processedCommand = false;
        let sendCommands: string[] = [];
        
        switch(command) {
            case "drink": {
                // TODO : Allow variables for storage container and drink container 
                processedCommand = true;
                break;
            }
            case "gohome": {
                processedCommand = true;
                // TODO: Execute return to safe room from recall
                break;
            }
            case "buff": {
                processedCommand = true;
                /*
                Fetch active character, check class and level and execute
                appropriate buffs
                    // TODO (s)
                    case dslClass.Swashbuckler:
                    case dslClass.Samurai:
                    case dslClass.Ranger:
                    case dslClass.Dragonslayer:
                    case dslClass.Battlerager:
                    case dslClass.Barbarian:
                    case dslClass.Armsman:
                    case dslClass.Warrior:
                    case dslClass.Pirate:
                    case dslClass.Ninja:
                    case dslClass.Nightshade:
                    case dslClass.Bladesinger:
                    case dslClass.Bandit:
                    case dslClass.Assassin:
                    case dslClass.Thief:
                    case dslClass.Wujen:
                    case dslClass.Witch:
                    case dslClass.Warlock:
                    case dslClass.Transmuter:
                    case dslClass.Shadowmage:
                    case dslClass.Necromancer:
                    case dslClass.Mentalist:
                    case dslClass.Invoker:
                    case dslClass.Illusionist:
                    case dslClass.Enchantor:
                    case dslClass.Eldritch:
                    case dslClass.Battlemage:
                    case dslClass.Mage:
                    case dslClass.Shukenja:
                    case dslClass.Shaman:
                    case dslClass.Shadowknight:
                    case dslClass.Runesmith:
                    case dslClass.Priest:
                    case dslClass.Paladin:
                    case dslClass.Monk:
                    case dslClass.Druid:
                    case dslClass.Crusader:
                    case dslClass.Confessor:
                    case dslClass.Cleric:
                    case dslClass.Skald:
                    case dslClass.Ovate:
                    case dslClass.Jongleur:
                    case dslClass.Charlatan:
                    case dslClass.BrewMaster:
                    case dslClass.Bard
                    */
                break;
            }
            case "bless": {
                processedCommand = true;
                // TODO : Fetch active character blesses and execute
                break;
            }
            case "fireproof": {
                processedCommand = true;
                // TODO: Fetch active character fireproof and execute
                break;
            }
            case "blessproof": {
                processedCommand = true;
                // TODO: Execute active character bless and fireproof
                break;
            }
            case "ma": {
                sendCommands.push("map");
                break;
            }
            case "tele":
            case "tel":
            case "te": {
                processedCommand = true;
                sendCommands.push("c teleport self");
                break;
            }
            case "k": {
                processedCommand = true;
                console.log("Kill whom?");
                break;
            }
            case "c": {
                processedCommand = true;
                console.log("Cast which what where?");
                break;
            }
            case "show-areas": {
                processedCommand = true;
                break;
                // TODO
            }
        }

        // --- DEBUG COMMANDS --- //
        if(command === "echotest") {
            processedCommand = true;
            console.log("This is a test of ProcessSinglePartCommand echo");
        }
        // --- END DEBUG COMMANDS --- //

        // Nothing in the alias overwrote what we were trying to send
        // So just send the original command
        if(!processedCommand) {
            sendCommands.push(command);
        }
        return sendCommands;
    }

    /**
     * Processes commands that contain a space
     * @param command The command that was originally marked to be sent
     * @param commandParts String split array of raw command
     * @returns An array of commands that need to be sent to the server
     */
    async ProcessMultiPartCommand(command: string, commandParts: string[]): Promise<string[] | undefined> {
        let processedCommand: boolean = false;
        let sendCommands: string[] = [];

        // Quaff
        if(commandParts[0] === "q") {
            processedCommand = true;
            const quaffMessage = `quaff ${rejoinFromIndex(commandParts, 1)}`;
            sendCommands.push(quaffMessage);
        } else if(commandParts[0] === "c" && commandParts.length == 4) {
            processedCommand = true;
            let direction = "";
                switch(commandParts[2]) {
                    case "n":{
                        direction = "north";
                        break;
                    }
                    case "e": {
                        direction = "east";
                        break;
                    }
                    case "s": {
                        direction = "south";
                        break;
                    }
                    case "w": {
                        direction = "west";
                        break;
                    }
                    case "nw":{
                        direction = "northwest";
                        break;
                    }
                    case "ne": {
                        direction = "northeast";
                        break;
                    }
                    case "se": {
                        direction = "southeast";
                        break;
                    }
                    case "sw": {
                        direction = "southwest";
                        break;
                    }
                    default: {
                        direction = commandParts[2];
                        break;
                    }
                }

            // Short casting for ranged spells
            if(commandParts[1] === "f" || commandParts[1] == "fire" || commandParts[1] == "fireb") {
                const fireball = `c fireball ${direction} ${commandParts[3]}`;
                sendCommands.push(fireball);
            } else if(commandParts[1] === "l" || commandParts[1] == "light") {
                const lightning = `c lightning ${direction} ${commandParts[3]}`;
                sendCommands.push(lightning);
            } else if(commandParts[1] === "m" || commandParts[1] == "magic") {
                const missiles = `c 'magic missile' ${direction} ${commandParts[3]}`;
                sendCommands.push(missiles);
            } else if(commandParts[1] === "b" || commandParts[1] == "blizz") {
                const blizzra = `c blizzra ${direction} ${commandParts[3]}`;
                sendCommands.push(blizzra);
            }
        } else if(commandParts[0] === "cl") {
            processedCommand = true;
            // CreatureLore
            const rejoin = `${rejoinFromIndex(commandParts, 1)}`;
            const lookMessage: string = `look ${rejoin}`;
            const creatureloreMessage: string = `creaturelore ${rejoin}`;
            sendCommands.push(lookMessage);
            sendCommands.push(creatureloreMessage);
        } else if(commandParts[0] === "unlock") {
            processedCommand = true;
            // Unlock, open
            const rejoin = `${rejoinFromIndex(commandParts, 1)}`;
            const unlockMessage = `unlock ${rejoin}`;
            const openMessage = `open ${rejoin}`;
            sendCommands.push(unlockMessage);
            sendCommands.push(openMessage);
        } else if(commandParts[0] === "lock") {
            processedCommand = true;
            const rejoin = `${rejoinFromIndex(commandParts, 1)}`;
            const closeMessage = `close ${rejoin}`;
            const lockMessage = `lock ${rejoin}`;
            sendCommands.push(closeMessage);
            sendCommands.push(lockMessage);            
        } else if(commandParts[0] === "speedwalk") {
            processedCommand = true;
            // TODO : Speedwalk
        } else if(commandParts[0] === "show-areas") {
            processedCommand = true;
            // TODO : Show areas
        } else if(commandParts[0] === "target") {
            processedCommand = true;
            // TODO : Targeting
        } else if(commandParts[0] === "setroll") {
            processedCommand = true;
            // TODO : Set character roller
        }

        // --- DEBUG COMMANDS --- //
        if(commandParts?.[0] === "echo" && commandParts?.[1] === "test") {
            processedCommand = true;
            console.log("This is a test of ProcessMultiPartCommand echo");
        }
        
        // --- END DEBUG COMMANDS --- //

        // Nothing in the alias overwrote what we were trying to send
        // So just send the original command
        if(!processedCommand) {
            sendCommands.push(command);
        }
        return sendCommands;
    }
}