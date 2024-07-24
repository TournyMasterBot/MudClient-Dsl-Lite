import { DslError } from "../models/error-models/dsl-errors";

export interface IDslSession {
    GetSessionVariable<T>(key: keyof DslSession): T | undefined;
    SetSessionVariable<T>(key: keyof DslSession, value: T | undefined): void;
}

export class DslSession implements IDslSession {
    quitCount: number = 0;
    showBattleSpam: boolean = true;

    constructor(config: Partial<DslSession>) {
        Object.assign(this, config);
    }

    GetSessionVariable<T>(key: keyof DslSession): T | undefined {
        if (key in this) {
            return this[key] as unknown as T;
        }
        throw new DslError({
            message: `Variable ${String(key)} does not exist in DslSession`,
            traceLocation: "DslSession.GetSessionVariable"
        });
    }
    SetSessionVariable<T>(key: keyof DslSession, value: T | undefined): void {
        if (key in this) {
            (this as any)[key] = value;
            return;
        }
        throw new DslError({
            message: `Variable ${String(key)} does not exist in DslSession`,
            traceLocation: "DslSession.SetSessionVariable"
        });
    }
}

